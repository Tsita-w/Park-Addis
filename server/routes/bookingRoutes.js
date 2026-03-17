const express = require("express");
const router = express.Router();
const axios = require("axios");
const QRCode = require("qrcode");
const Slot = require("../models/Slot");
const Booking = require("../models/Booking");

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || "your_secret_key_here";

// --- 1. CREATE A BOOKING ---
// Endpoint: POST http://localhost:5000/api/bookings/create
router.post("/create", async (req, res) => {
  const { slotId, lotId, userId } = req.body;

  try {
    // ENFORCE: Find slot ONLY if it belongs to this specific lot AND is available
    const reservedSlot = await Slot.findOneAndUpdate(
      {
        _id: slotId,
        lotId: lotId, // <--- Logic Fix: Restricts the search to this lot only
        status: "available",
      },
      { $set: { status: "reserved" } },
      { new: true },
    );

    if (!reservedSlot) {
      return res.status(400).json({
        message: "Slot is already taken or does not belong to this lot.",
      });
    }

    // Create booking...
    const newBooking = new Booking({ userId, slotId, lotId, status: "active" });
    await newBooking.save();

    // ... (rest of your QR generation code)
    res.status(201).json({ message: "Success!", booking: newBooking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// --- 2. VERIFY QR CODE (For Check-in/Check-out) ---
// Endpoint: POST http://localhost:5000/api/bookings/verify
router.post("/verify", async (req, res) => {
  const { bookingId } = req.body;

  try {
    const booking = await Booking.findById(bookingId);

    if (!booking) {
      return res
        .status(404)
        .json({ message: "Invalid QR Code - Booking not found" });
    }

    if (booking.status === "completed") {
      return res
        .status(400)
        .json({ message: "This QR code has already been used." });
    }

    // Update status to mark the user as 'arrived' or 'finished'
    booking.status = "completed";
    await booking.save();

    const updatedSlot = await Slot.findByIdAndUpdate(
      booking.slotId,
      { status: "occupied" }, // Marks the physical space as full
      { new: true },
    );

    res.json({
      success: true,
      message: "Entry Granted!",
      slotNumber: updatedSlot ? updatedSlot.slotNumber : "N/A",
    });
  } catch (err) {
    res.status(500).json({ message: "Verification error: " + err.message });
  }
});

// --- 3. GET BOOKING HISTORY ---
// Endpoint: GET http://localhost:5000/api/bookings/user/:userId
router.get("/user/:userId", async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate("lotId") // Joins with Parking collection to get the name
      .populate("slotId") // Joins with Slot collection to get the number
      .sort({ createdAt: -1 }); // Shows the most recent booking at the top

    res.status(200).json(bookings);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error fetching history", error: err.message });
  }
});

// POST /api/bookings/pay
router.post("/pay", async (req, res) => {
  try {
    const { slotId, lotId, amount, userId } = req.body;

    // Create ONE unique reference to use for both DB and Chapa
    const tx_ref = `tx-parkaddis-${Date.now()}`;

    const newBooking = new Booking({
      slotId,
      lotId,
      userId,
      amount,
      paymentStatus: "pending",
      transactionId: tx_ref, // Using the variable above
    });
    await newBooking.save();

    const paymentPayload = {
      amount: amount,
      currency: "ETB",
      email: "test@gmail.com",
      first_name: "Tsita",
      tx_ref: tx_ref, // Use the SAME variable here
      callback_url: `${process.env.BASE_URL}/api/bookings/webhook`,
      return_url: `http://localhost:3000/booking-success`,
    };

    // 3. Call Chapa API to get the checkout URL
    const response = await axios.post(
      "https://api.chapa.co/v1/transaction/initialize",
      paymentPayload,
      { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } },
    );

    console.log("CHAPA RESPONSE DATA:", response.data);

    // 4. Send the checkout URL back to the frontend
    if (response.data.status === "success") {
      res.json({ checkout_url: response.data.data.checkout_url });
    } else {
      res.status(400).json({ message: "Payment initialization failed" });
    }
  } catch (err) {
    console.error("Payment Error:", err.response?.data || err.message);
    res.status(500).json({ message: "Server Error during payment" });
  }
});

// This route handles the "Secret Message" from Chapa
router.post("/webhook", async (req, res) => {
  const { tx_ref, status } = req.body;

  if (status === "success") {
    // FIX: Use transactionId (the name you used in the /pay route)
    const booking = await Booking.findOne({ transactionId: tx_ref });

    if (booking) {
      booking.paymentStatus = "success"; // Match your schema's field name
      booking.status = "completed";
      await booking.save();

      // Ensure the Slot status is updated so it disappears from the map
      await Slot.findByIdAndUpdate(booking.slotId, {
        status: "reserved", // or "occupied" based on your frontend logic
        isAvailable: false,
      });

      console.log(`✅ SUCCESS: Slot ${booking.slotId} is now reserved!`);
    }
  }
  res.status(200).send("OK");
});

// GET /api/bookings/admin/stats
router.get("/admin/stats", async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments({ status: "completed" });

    // Calculate total revenue
    const bookings = await Booking.find({ status: "completed" });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

    // Count occupied slots
    const occupiedSlots = await Slot.countDocuments({ isAvailable: false });

    res.json({
      totalRevenue,
      totalBookings,
      occupiedSlots,
      activeUsers: 12,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/bookings/admin/list
router.get("/admin/list", async (req, res) => {
  try {
    const allBookings = await Booking.find()
      .populate("userId", "name email")
      .populate("slotId", "label")
      .populate("lotId", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json(allBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 1. MANUALLY RESET A SLOT
router.patch("/admin/slots/:id/reset", async (req, res) => {
  try {
    const slot = await Slot.findByIdAndUpdate(
      req.params.id,
      { status: "available", isAvailable: true },
      { new: true },
    );
    res.json({ message: "Slot is now available", slot });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. DELETE A TRANSACTION
router.delete("/admin/bookings/:id", async (req, res) => {
  try {
    await Booking.findByIdAndDelete(req.params.id);
    res.json({ message: "Transaction deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/current-price/:lotId", async (req, res) => {
  const totalSlots = await Slot.countDocuments({ lotId: req.params.lotId });
  const occupiedSlots = await Slot.countDocuments({ lotId: req.params.lotId, isAvailable: false });
  const occupancyRate = occupiedSlots / totalSlots;

  const basePrice = 50; // You can also fetch this from the 'Parking' model
  const finalPrice = calculateDynamicPrice(basePrice, occupancyRate);

  res.json({
    price: finalPrice,
    multiplier: (finalPrice / basePrice).toFixed(1),
    demandLevel: occupancyRate > 0.8 ? "High" : "Normal"
  });
});

module.exports = router;

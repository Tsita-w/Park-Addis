const express = require('express');
const router = express.Router();
const axios = require('axios');
const QRCode = require('qrcode');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'your_secret_key_here';

// --- 1. CREATE A BOOKING ---
// Endpoint: POST http://localhost:5000/api/bookings/create
router.post('/create', async (req, res) => {
    const { slotId, lotId, userId } = req.body;

    try {
        // ENFORCE: Find slot ONLY if it belongs to this specific lot AND is available
        const reservedSlot = await Slot.findOneAndUpdate(
            {
                _id: slotId,
                lotId: lotId, // <--- Logic Fix: Restricts the search to this lot only
                status: 'available'
            },
            { $set: { status: 'reserved' } },
            { new: true }
        );

        if (!reservedSlot) {
            return res.status(400).json({
                message: "Slot is already taken or does not belong to this lot."
            });
        }

        // Create booking...
        const newBooking = new Booking({ userId, slotId, lotId, status: 'active' });
        await newBooking.save();

        // ... (rest of your QR generation code)
        res.status(201).json({ message: "Success!", booking: newBooking });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// --- 2. VERIFY QR CODE (For Check-in/Check-out) ---
// Endpoint: POST http://localhost:5000/api/bookings/verify
router.post('/verify', async (req, res) => {
    const { bookingId } = req.body;

    try {
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Invalid QR Code - Booking not found" });
        }

        if (booking.status === 'completed') {
            return res.status(400).json({ message: "This QR code has already been used." });
        }

        // Update status to mark the user as 'arrived' or 'finished'
        booking.status = 'completed';
        await booking.save();

        const updatedSlot = await Slot.findByIdAndUpdate(
            booking.slotId,
            { status: 'occupied' }, // Marks the physical space as full
            { new: true }
        );

        res.json({
            success: true,
            message: "Entry Granted!",
            slotNumber: updatedSlot ? updatedSlot.slotNumber : "N/A"
        });

    } catch (err) {
        res.status(500).json({ message: "Verification error: " + err.message });
    }
});

// --- 3. GET BOOKING HISTORY ---
// Endpoint: GET http://localhost:5000/api/bookings/user/:userId
router.get('/user/:userId', async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.params.userId })
      .populate('lotId')   // Joins with Parking collection to get the name
      .populate('slotId')  // Joins with Slot collection to get the number
      .sort({ createdAt: -1 }); // Shows the most recent booking at the top

    res.status(200).json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Error fetching history", error: err.message });
  }
});

// POST /api/bookings/pay
router.post('/pay', async (req, res) => {
    try {
        const { slotId, lotId, amount, userId } = req.body;
        const tx_ref = `tx-parkaddis-${Date.now()}`;

        // 1. Create the Booking in your database as 'pending'
        const newBooking = new Booking({
            slotId,
            lotId,
            userId,
            amount,
            paymentStatus: 'pending',
            transactionId: tx_ref
        });
        await newBooking.save();

        // 2. Prepare the payload for the Payment Gateway (e.g., Chapa)
        const paymentPayload = {
            amount: amount,
            currency: "ETB",
            email: "t687959@gmail.com", // In production, get from user auth
            first_name: "User",
            last_name: "Name",
            tx_ref: tx_ref,
            callback_url: "http://your-server-url.com/api/bookings/webhook", // Your live URL
            return_url: "http://localhost:3000/booking-success",
            "customization[title]": "Parking Payment",
            "customization[description]": "Payment for Slot Reservation"
        };

        // 3. Call Chapa API to get the checkout URL
        const response = await axios.post(
            'https://api.chapa.co/v1/transaction/initialize',
            paymentPayload,
            { headers: { Authorization: `Bearer ${CHAPA_SECRET_KEY}` } }
        );

        // 4. Send the checkout URL back to the frontend
        if (response.data.status === 'success') {
            res.json({ checkout_url: response.data.data.checkout_url });
        } else {
            res.status(400).json({ message: "Payment initialization failed" });
        }

    } catch (err) {
        console.error("Payment Error:", err.response?.data || err.message);
        res.status(500).json({ message: "Server Error during payment" });
    }
});

// @route   POST /api/bookings/webhook
// @desc    Listen for payment confirmation from gateway
router.post('/webhook', async (req, res) => {
    // Note: In production, verify the secret hash/signature from Chapa here!
    const { tx_ref, status } = req.body;

    if (status === 'success') {
        try {
            // 1. Find the booking using the transaction reference
            const booking = await Booking.findOne({ transactionId: tx_ref });

            if (booking) {
                // 2. Update booking to 'paid'
                booking.paymentStatus = 'paid';
                await booking.save();

                // 3. FINALLY: Mark the actual slot as 'reserved'
                await Slot.findByIdAndUpdate(booking.slotId, { status: 'reserved' });

                console.log(`✅ Payment confirmed for Slot: ${booking.slotId}`);
            }
            res.sendStatus(200);
        } catch (err) {
            console.error("Webhook Error:", err);
            res.sendStatus(500);
        }
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;
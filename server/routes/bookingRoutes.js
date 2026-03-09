const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

// --- 1. CREATE A BOOKING ---
// Matches: POST http://localhost:5000/api/bookings/create
router.post('/create', async (req, res) => {
    // We use lotId to match your frontend fetch request
    const { slotId, lotId, userId, startTime, endTime } = req.body;

    try {
        // Atomic Update: Find the slot ONLY if it is still 'available'
        // This prevents two users from booking the same spot at the exact same time.
        const reservedSlot = await Slot.findOneAndUpdate(
            { _id: slotId, status: 'available' },
            { $set: { status: 'reserved' } },
            { new: true }
        );

        if (!reservedSlot) {
            return res.status(400).json({
                message: "Sorry, this specific slot was just taken! Please try another one."
            });
        }

        // Create the booking record
        const newBooking = new Booking({
            userId: userId || "Guest_User",
            slotId,
            lotId, // Linked to the parking lot/garage ID
            startTime: startTime || new Date(),
            endTime: endTime || null,
            status: 'active'
        });

        const savedBooking = await newBooking.save();

        // Generate QR Data - Stores ID so the guard can scan it to grant entry
        const qrData = JSON.stringify({
            bookingId: savedBooking._id,
            slotNumber: reservedSlot.slotNumber
        });

        // Convert data to a Base64 Image string for your React frontend
        const qrCodeImage = await QRCode.toDataURL(qrData);

        res.status(201).json({
            message: "Booking successful!",
            qrCode: qrCodeImage,
            booking: savedBooking
        });

    } catch (err) {
        console.error("Booking Error:", err.message);
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

// --- 2. VERIFY QR CODE (For the Security Guard) ---
// Matches: POST http://localhost:5000/api/bookings/verify
router.post('/verify', async (req, res) => {
    const { bookingId } = req.body;

    try {
        // 1. Find the booking and get slot details
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).json({ message: "Invalid QR Code - Booking not found" });
        }

        // 2. Check if the booking is already used
        if (booking.status === 'completed') {
            return res.status(400).json({ message: "This QR code has already been used for entry." });
        }

        // 3. Update the Booking to 'completed' and Slot to 'occupied'
        booking.status = 'completed';
        await booking.save();

        const updatedSlot = await Slot.findByIdAndUpdate(
            booking.slotId,
            { status: 'occupied' },
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

module.exports = router;
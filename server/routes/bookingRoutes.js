const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const Slot = require('../models/Slot');
const Booking = require('../models/Booking');

router.post('/book', async (req, res) => {
    const { slotId, userId, startTime, endTime } = req.body;

    try {
        // Atomic Update: Find the slot ONLY if it is still 'available'
        // and update it to 'reserved' in the same database request.
        const reservedSlot = await Slot.findOneAndUpdate(
            { _id: slotId, status: 'available' },
            { $set: { status: 'reserved' } },
            { new: true } // Returns the updated document
        );

        if (!reservedSlot) {
            return res.status(400).json({ message: "Sorry, this slot was just taken!" });
        }

        // If the update succeeded, create the booking record
        const newBooking = new Booking({
            userId,
            slotId,
            startTime,
            endTime,
            paymentStatus: 'pending'
        });

        await newBooking.save();

        const qrData = `BookingID: ${newBooking._id}`;
        const qrCodeImage = await QRCode.toDataURL(qrData);

        res.status(201).json({ message: "Booking successful!",qrCode: qrCodeImage, booking: newBooking });

    } catch (err) {
        res.status(500).json({ message: "Server error: " + err.message });
    }
});

module.exports = router;
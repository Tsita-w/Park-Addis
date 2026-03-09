const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');

// GET all slots for a specific parking lot ID
// This matches: http://localhost:5000/api/slots/parking/[ID]
router.get('/parking/:lotId', async (req, res) => {
    try {
        console.log("Searching for slots with lotId:", req.params.lotId);

        const slots = await Slot.find({ lotId: req.params.lotId });

        if (slots.length === 0) {
            console.log("No slots found in DB for this ID.");
            return res.status(404).json({ message: "No slots found for this lot." });
        }

        res.json(slots);
    } catch (err) {
        console.error("Database Error:", err.message);
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// Keep your 'available' only route if you need it elsewhere
router.get('/:lotId/available', async (req, res) => {
    try {
        const availableSlots = await Slot.find({
            lotId: req.params.lotId,
            status: 'available'
        });
        res.json(availableSlots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
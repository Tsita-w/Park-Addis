const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');

// GET all available slots for a specific lot
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

router.get('/all/:lotId', async (req, res) => {
    try {
        const slots = await Slot.find({ lotId: req.params.lotId });

        if (slots.length === 0) {
            return res.status(404).json({ message: "No slots found for this lot." });
        }

        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});


module.exports = router;
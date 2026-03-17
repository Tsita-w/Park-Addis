const express = require('express');
const router = express.Router();
const Slot = require('../models/Slot');

router.get('/parking/:lotId', async (req, res) => {
    try {
        const slots = await Slot.find({ lotId: req.params.lotId });
        console.log(`Found ${slots.length} slots for ${req.params.lotId}`);
        res.json(slots);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// --- GET only available slots for a lot ---
router.get('/:lotId/available', async (req, res) => {
    try {
        const availableSlots = await Slot.find({
            lotId: req.params.lotId,
            status: 'available'
        });
        res.json(availableSlots);
    } catch (err) {
        res.status(500).json({ message: "Server Error: " + err.message });
    }
});

// GET /api/slots/dashboard
router.get("/dashboard", async (req, res) => {
  try {
    const slots = await Slot.find().select('label status isAvailable lotId');
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
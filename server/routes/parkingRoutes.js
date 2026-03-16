const express = require('express');
const router = express.Router();
const Parking = require('../models/Parking');
const Slot = require('../models/Slot');

// @route   GET /api/parking/all
router.get('/all', async (req, res) => {
    try {
        const spots = await Parking.find().lean();

        const spotsWithAvailability = await Promise.all(
            spots.map(async (spot) => {
                // Matches the 'lotId' field in your Slot model
                const availableCount = await Slot.countDocuments({
                    lotId: spot._id,
                    status: 'available'
                });
                return { ...spot, availableCount };
            })
        );
        res.json(spotsWithAvailability);
    } catch (err) {
        console.error("Error in parking/all:", err.message);
        // CRITICAL: Return [] instead of {message} to prevent frontend filter crash
        res.status(500).json([]);
    }
});

// @route   GET /api/parking/:id
router.get('/:id', async (req, res) => {
    try {
        const spot = await Parking.findById(req.params.id).lean();
        if (!spot) return res.status(404).json({ message: "Parking spot not found" });

        const availableCount = await Slot.countDocuments({
            lotId: spot._id,
            status: 'available'
        });

        res.json({ ...spot, availableCount });
    } catch (err) {
        console.error("Error in parking/:id:", err.message);
        res.status(500).json({ message: "Server Error" });
    }
});

module.exports = router;
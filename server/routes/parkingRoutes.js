const express = require('express');
const router = express.Router();
const Parking = require('../models/Parking');
const Slot = require('../models/Slot');

// @route   GET /api/parking/all
// @desc    Get all parking spots with real-time available slot counts
router.get('/all', async (req, res) => {
    try {
        // 1. Fetch all parking garages from Atlas
        const spots = await Parking.find().lean();

        // 2. For each garage, calculate the current availability dynamically
        const spotsWithAvailability = await Promise.all(
            spots.map(async (spot) => {
                const availableCount = await Slot.countDocuments({
                    parkingSpotId: spot._id,
                    status: 'available'
                });

                return {
                    ...spot,
                    availableCount // This is the "Real-time" part!
                };
            })
        );

        res.json(spotsWithAvailability);
    } catch (err) {
        console.error("Error in parking/all:", err.message);
        res.status(500).json({ message: "Server Error: Could not fetch parking data" });
    }
});

// @route   GET /api/parking/:id
// @desc    Get a single parking spot's details
router.get('/:id', async (req, res) => {
    try {
        const spot = await Parking.findById(req.params.id);
        if (!spot) return res.status(404).json({ message: "Parking spot not found" });

        const availableCount = await Slot.countDocuments({
            parkingSpotId: spot._id,
            status: 'available'
        });

        res.json({ ...spot.toObject(), availableCount });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
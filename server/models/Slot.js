const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema({
    lotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lot' },
    slotNumber: String, // e.g., "A-1"
    status: { type: String, enum: ['available', 'occupied', 'reserved'], default: 'available' },
    isEV: { type: Boolean, default: false }
});

module.exports = mongoose.model('Slot', slotSchema);
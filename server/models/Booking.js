const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot', required: true },
    lotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
    userId: { type: String, required: true },
    startTime: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
});

module.exports = mongoose.model('Booking', bookingSchema);
const mongoose = require('mongoose');
const slotSchema = new mongoose.Schema({
    slotNumber: { type: String, required: true },
    lotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
    status: { type: String, enum: ['available', 'reserved', 'occupied'], default: 'available' }
});
module.exports = mongoose.model('Slot', slotSchema);

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Slot' },
    startTime: Date,
    endTime: Date,
    totalPrice: Number,
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    qrCode: String // We will generate this later
});

module.exports = mongoose.model('Booking', bookingSchema);
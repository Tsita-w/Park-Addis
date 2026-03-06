const mongoose = require('mongoose');

const lotSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    pricePerHour: { type: Number, required: true },
    totalSlots: { type: Number, required: true },
});

module.exports = mongoose.model('Lot', lotSchema);
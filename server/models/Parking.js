const mongoose = require('mongoose');

const ParkingSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pricePerHour: { type: Number, required: true },
  distance: { type: String },
  rating: { type: Number, default: 0 },
  totalSpots: { type: Number },
  availableSpots: { type: Number },
  coordinates: {
    lat: { type: Number },
    lng: { type: Number }
  },
  isRecommended: { type: Boolean, default: false }
});

module.exports = mongoose.model('Parking', ParkingSchema);
const mongoose = require('mongoose');

const parkingLotSchema = new mongoose.Schema({
  name: String,
  address: String,
  pricePerHour: Number,
  totalSlots: Number,
  availableSlots: Number,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  image: String // URL to a parking lot photo
});

module.exports = mongoose.model('ParkingLot', parkingLotSchema);
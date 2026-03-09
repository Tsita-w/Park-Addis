const mongoose = require('mongoose');
const Parking = require('./models/Parking'); // Ensure this path matches your model
require('dotenv').config();

// Replace with your MongoDB Atlas Connection String if not using .env
const MONGO_URI = process.env.MONGO_URI || "your_mongodb_atlas_connection_string_here";

const mockSpots = [
  {
    name: "Bole Medhanialem Mall Underground",
    pricePerHour: 10,
    distance: "0.2 km",
    rating: 4.8,
    isRecommended: true,
    coordinates: { lat: 8.9984, lng: 38.7850 }
  },
  {
    name: "Edna Mall Parking Lot",
    pricePerHour: 8,
    distance: "0.5 km",
    rating: 4.5,
    isRecommended: false,
    coordinates: { lat: 8.9975, lng: 38.7842 }
  },
  {
    name: "Kazanchis Intercontinental Garage",
    pricePerHour: 15,
    distance: "2.1 km",
    rating: 4.9,
    isRecommended: true,
    coordinates: { lat: 9.0215, lng: 38.7667 }
  },
  {
    name: "Piassa Churchill Ave Street Parking",
    pricePerHour: 5,
    distance: "3.8 km",
    rating: 3.9,
    isRecommended: false,
    coordinates: { lat: 9.0300, lng: 38.7530 }
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to Atlas for seeding...");

    // Clear existing data so we don't have duplicates
    await Parking.deleteMany({});

    // Insert new data
    await Parking.insertMany(mockSpots);
    console.log("Successfully added 4 parking spots in Addis!");

    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedDB();
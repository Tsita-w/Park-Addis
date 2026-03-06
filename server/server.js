const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 1. Initialize the app FIRST
const app = express();

// 2. Import your routes
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// 3. Middleware (Must come before routes)
app.use(cors());
app.use(express.json());

// 4. Register your routes
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);

// LOG FOR DEBUGGING
console.log("------------------------------------");
if (process.env.MONGO_URI) {
    console.log("✅ Secret found! Attempting to connect...");
} else {
    console.log("❌ Secret NOT found!");
}
console.log("------------------------------------");

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟");
        console.log("✅ SUCCESS: PARK-ADDIS IS LIVE!");
        console.log("🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟🌟");
    })
    .catch((err) => {
        console.log("❌ DATABASE ERROR:", err.message);
    });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
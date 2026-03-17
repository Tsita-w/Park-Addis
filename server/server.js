const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // Fixes MongoDB connection issues in Ethiopia

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const startCleanupTask = require('./utils/cleanup');

const app = express();

// Import Routes
const parkingRoutes = require('./routes/parkingRoutes');
const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/parking', parkingRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/', (req, res) => {
    res.send("Park-Addis Server is running!");
});

// Database Connection Logic
console.log("------------------------------------");
if (process.env.MONGO_URI) {
    console.log("✅ MONGO_URI found! Attempting to connect...");
} else {
    console.log("❌ MONGO_URI NOT found in .env!");
}

// 💳 THE CHAPA CHECK YOU REQUESTED
console.log("💳 Chapa Key Loaded:", process.env.CHAPA_SECRET_KEY ? "YES (Ready to pay)" : "NO (Check .env)");
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

    startCleanupTask();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
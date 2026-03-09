const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// 1. IMPORT THE PARKING ROUTES (Add this line)
const parkingRoutes = require('./routes/parkingRoutes');

const slotRoutes = require('./routes/slotRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use(cors());
app.use(express.json());

// 2. REGISTER THE PARKING ROUTES (Add this line)
app.use('/api/parking', parkingRoutes);

app.use('/api/slots', slotRoutes);
app.use('/api/bookings', bookingRoutes);

// --- REST OF YOUR CODE (MONGOOSE CONNECT & LISTEN) ---

// 3. ADD A "HOME" ROUTE FOR QUICK TESTING (Optional but helpful)
app.get('/', (req, res) => {
    res.send("Park-Addis Server is running!");
});

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
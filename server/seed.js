const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const Lot = require('./models/Lot');
const Slot = require('./models/Slot');

const seedDatabase = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected for seeding...");

        // 1. Clear existing data so we don't have duplicates
        await Lot.deleteMany({});
        await Slot.deleteMany({});

        // 2. Create a Parking Lot
        const myLot = await Lot.create({
            name: "Bole Mall Parking",
            location: "Bole, Addis Ababa",
            pricePerHour: 20,
            totalSlots: 10
        });

        // 3. Create 10 Slots for this lot
        const slotsToCreate = [];
        for (let i = 1; i <= 10; i++) {
            slotsToCreate.push({
                lotId: myLot._id,
                slotNumber: `A-${i}`,
                status: 'available',
                isEV: i > 8 // Make the last two slots EV charging
            });
        }

        await Slot.insertMany(slotsToCreate);

        console.log("✅ Successfully added 1 Parking Lot and 10 Slots!");
        process.exit(); // Close the script
    } catch (err) {
        console.error("❌ Seeding failed:", err);
        process.exit(1);
    }
};

seedDatabase();
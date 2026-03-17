const mongoose = require("mongoose");


const bookingSchema = new mongoose.Schema(
  {
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    lotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Parking",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    // Track the physical booking state
    status: {
      type: String,
      enum: ["active", "completed", "cancelled"],
      default: "active",
    },
    // --- NEW PAYMENT FIELDS ---
    amount: {
      type: Number,
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    // This stores the unique ID from Telebirr/Chapa/CBE Birr
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // Allows this to be empty until payment starts
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);

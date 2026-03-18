const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // --- RELATIONSHIPS ---
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

    // --- VEHICLE INFO ---
    plateNumber: {
      type: String,
      required: true,
    },

    // --- TIME TRACKING ---
    checkInTime: {
      type: Date,
      default: Date.now,
    },
    checkOutTime: {
      type: Date,
    },

    // --- STATUS ---
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"], // Consistent Capitalization
      default: "Active",
    },

    // --- MONEY & PAYMENTS ---
    totalPrice: {
      type: Number,
      default: 0,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);

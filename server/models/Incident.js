const mongoose = require('mongoose');

const IncidentSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., "Damage", "Security", "Other"
  description: { type: String, required: true },
  plateNumber: { type: String }, // Optional: link to a specific car
  reportedBy: { type: String, default: "Attendant" },
  status: { type: String, default: "Pending" }, // Pending, Resolved
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Incident', IncidentSchema);
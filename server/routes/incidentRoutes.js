const router = require('express').Router();
const Incident = require('../models/Incident');

router.post('/report', async (req, res) => {
  try {
    const newIncident = new Incident(req.body);
    await newIncident.save();
    res.status(201).json({ message: "Incident reported successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to save report" });
  }
});

module.exports = router;
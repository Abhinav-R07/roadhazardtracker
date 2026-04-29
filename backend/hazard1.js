const express = require('express');
const router = express.Router();
const Hazard = require('../models/Hazard');
const authMiddleware = require('../middleware/auth');

// Create a new hazard report (protected route)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, description, location, severity } = req.body;
    const userId = req.user.id;

    if (!title || !description || !location || !location.coordinates) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const hazard = new Hazard({
      title,
      description,
      location,
      severity,
      reportedBy: userId,
    });

    const savedHazard = await hazard.save();
    res.status(201).json(savedHazard);
  } catch (error) {
    console.error('Error creating hazard:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all hazard reports (public route)
router.get('/', async (req, res) => {
  try {
    const hazards = await Hazard.find().populate('reportedBy', 'name email').sort({ createdAt: -1 });
    res.json(hazards);
  } catch (error) {
    console.error('Error fetching hazards:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

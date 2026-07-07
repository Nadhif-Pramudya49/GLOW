const express = require('express');
const router = express.Router();
const productivityController = require('../controllers/productivity.controller');
const authMiddleware = require('../middlewares/auth');

// Protect all productivity routes
router.use(authMiddleware.verifyToken);

// Itinerary
router.get('/itinerary/:bookingId', productivityController.getItineraries);
router.post('/itinerary/:bookingId', productivityController.addItinerary);
router.delete('/itinerary/:id', productivityController.deleteItinerary);

// Mood logs
router.get('/mood/:bookingId', productivityController.getMoodLogs);
router.post('/mood/:bookingId', productivityController.logMood);

module.exports = router;

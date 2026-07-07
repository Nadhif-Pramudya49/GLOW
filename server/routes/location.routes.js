const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);
router.get('/:id/google-reviews', locationController.getGoogleReviews);

module.exports = router;

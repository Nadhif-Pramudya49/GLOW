const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');

router.get('/', locationController.getAllLocations);
router.get('/:id', locationController.getLocationById);

module.exports = router;

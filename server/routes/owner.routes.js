const express = require('express');
const router = express.Router();
const ownerController = require('../controllers/owner.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload');

// Semua route di owner harus login dan ber-role OWNER
router.use(verifyToken, requireRole(['OWNER']));

router.get('/locations', ownerController.getMyLocations);
router.post('/locations', upload.single('image'), ownerController.createLocation);
router.put('/locations/:id', upload.single('image'), ownerController.updateLocation);
router.delete('/locations/:id', ownerController.deleteLocation);

router.get('/bookings', ownerController.getOwnerBookings);
router.put('/bookings/:id/status', ownerController.updateBookingStatus);

router.get('/stats', ownerController.getOwnerStats);
router.get('/reviews', ownerController.getOwnerReviews);

module.exports = router;

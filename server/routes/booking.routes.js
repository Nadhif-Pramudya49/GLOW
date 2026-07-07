const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Mengizinkan USER, ADMIN, dan OWNER untuk membuat dan melihat riwayat pesanan
router.use(verifyToken, requireRole(['USER', 'ADMIN', 'OWNER']));

router.get('/me', bookingController.getMyBookings);
router.post('/', bookingController.createBooking);

module.exports = router;

const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/auth');

// POST: Buat ulasan baru (Harus login)
router.post('/', authMiddleware.verifyToken, reviewController.createReview);

// GET: Ambil ulasan berdasarkan ID lokasi (Publik)
router.get('/location/:locationId', reviewController.getReviewsByLocation);

module.exports = router;

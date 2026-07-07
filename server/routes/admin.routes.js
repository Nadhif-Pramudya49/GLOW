const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { verifyToken, requireRole } = require('../middlewares/auth');

// Semua route di admin harus login dan ber-role ADMIN
router.use(verifyToken, requireRole(['ADMIN']));

router.get('/stats', adminController.getStats);

// Businesses
router.get('/businesses', adminController.getBusinesses);
router.put('/businesses/:id/status', adminController.updateBusinessStatus);

// Users
router.get('/users', adminController.getUsers);
router.get('/users/:id/details', adminController.getUserDetails);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);

// Locations
router.get('/locations', adminController.getAllLocations);
router.put('/locations/:id/publish', adminController.toggleLocationPublish);
router.delete('/locations/:id', adminController.deleteLocation);

module.exports = router;

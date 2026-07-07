const express = require('express');
const router = express.Router();
const packageController = require('../controllers/package.controller');
const { verifyToken } = require('../middlewares/auth');

router.use(verifyToken);
router.get('/saved', packageController.getSavedPackages);
router.post('/saved', packageController.savePackage);
router.delete('/saved/:id', packageController.deleteSavedPackage);

module.exports = router;

const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');

router.post('/package', aiController.generatePackage);

module.exports = router;

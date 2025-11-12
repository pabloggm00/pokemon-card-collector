const express = require('express');
const router = express.Router();
const raritiesController = require('../controllers/rarities.controller');

// GET /api/rarities - Obtener todas las rarezas
router.get('/', raritiesController.getAllRarities);

module.exports = router;
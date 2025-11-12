const express = require('express');
const router = express.Router();
const importController = require('../controllers/import.controller');

// GET /api/import/sets-catalog - Obtener lista de sets disponibles
router.get('/sets-catalog', importController.getAvailableSets);

// POST /api/import/set - Importar un set desde TCGdex
router.post('/set', importController.importSetFromAPI);

module.exports = router;

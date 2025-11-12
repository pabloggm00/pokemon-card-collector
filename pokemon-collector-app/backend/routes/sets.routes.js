const express = require('express');
const router = express.Router();
const setsController = require('../controllers/sets.controller');

// GET /api/sets - Obtener todos los sets
router.get('/', setsController.getAllSets);

// GET /api/sets/:id - Obtener un set por ID
router.get('/:id', setsController.getSetById);

// DELETE /api/sets/:id - Eliminar un set
router.delete('/:id', setsController.deleteSet);

module.exports = router;
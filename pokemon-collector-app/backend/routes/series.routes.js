const express = require('express');
const router = express.Router();
const seriesController = require('../controllers/series.controller');

// GET /api/series - Obtener todas las series
router.get('/', seriesController.getAllSeries);

// GET /api/series/:id - Obtener una serie por ID
router.get('/:id', seriesController.getSeriesById);

// DELETE /api/series/:id - Eliminar una serie
router.delete('/:id', seriesController.deleteSeries);

module.exports = router;
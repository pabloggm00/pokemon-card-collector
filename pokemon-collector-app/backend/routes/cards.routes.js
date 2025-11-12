const express = require('express');
const router = express.Router();
const cardsController = require('../controllers/cards.controller');

// GET /api/cards - Obtener todas las cartas (con filtros opcionales)
router.get('/', cardsController.getAllCards);

// GET /api/cards/:id - Obtener una carta por ID
router.get('/:id', cardsController.getCardById);

// GET /api/cards/set/:setId - Obtener cartas de un set
router.get('/set/:setId', cardsController.getCardsBySet);

module.exports = router;
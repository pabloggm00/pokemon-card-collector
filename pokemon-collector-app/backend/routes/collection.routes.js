const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collection.controller');

// GET /api/collections - Listar todas las colecciones
router.get('/', collectionController.getCollections);

// GET /api/collections/:id - Obtener detalle de una colección
router.get('/:id', collectionController.getCollectionById);

// POST /api/collections - Crear nueva colección desde un set
router.post('/', collectionController.createCollection);

// POST /api/collections/custom - Crear colección personalizada
router.post('/custom', collectionController.createCustomCollection);

// POST /api/collections/:id/cards - Añadir cartas a una colección personalizada
router.post('/:id/cards', collectionController.addCardsToCollection);

// DELETE /api/collections/:id/cards/:cardId - Eliminar carta de una colección personalizada
router.delete('/:id/cards/:cardId', collectionController.removeCardFromCollection);

// PATCH /api/collections/:id/cards/:cardId - Actualizar quantity de una carta
router.patch('/:id/cards/:cardId', collectionController.updateCardQuantity);

// DELETE /api/collections/:id - Eliminar una colección
router.delete('/:id', collectionController.deleteCollection);

module.exports = router;

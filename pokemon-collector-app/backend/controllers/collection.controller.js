const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// GET /api/collections - Listar todas las colecciones
const getCollections = async (req, res) => {
  try {
    const collections = await prisma.collection.findMany({
      include: {
        set: {
          include: {
            series: true
          }
        },
        _count: {
          select: { collectionCards: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Calcular estadísticas para cada colección
    const collectionsWithStats = await Promise.all(
      collections.map(async (collection) => {
        const totalCards = await prisma.collectionCard.count({
          where: { collectionId: collection.id }
        });

        const ownedCards = await prisma.collectionCard.count({
          where: {
            collectionId: collection.id,
            quantity: { gt: 0 }
          }
        });

        return {
          ...collection,
          totalCards,
          ownedCards
        };
      })
    );

    res.json(collectionsWithStats);
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ error: 'Error fetching collections' });
  }
};

// GET /api/collections/:id - Obtener detalle de una colección
const getCollectionById = async (req, res) => {
  try {
    const { id } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) },
      include: {
        set: {
          include: {
            series: true
          }
        },
        collectionCards: {
          include: {
            card: {
              include: {
                rarity: true,
                set: true
              }
            }
          },
          orderBy: {
            card: {
              number: 'asc'
            }
          }
        }
      }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Mapear cardType a type para el frontend (igual que en cards.controller)
    // Convertir "Pokemon", "Trainer", "Energy" a "POKEMON", "TRAINER", "ENERGY"
    if (collection.collectionCards) {
      const typeMap = {
        'Pokemon': 'POKEMON',
        'Trainer': 'TRAINER',
        'Energy': 'ENERGY'
      };
      
      collection.collectionCards = collection.collectionCards.map(cc => ({
        ...cc,
        card: {
          ...cc.card,
          type: typeMap[cc.card.cardType] || cc.card.cardType.toUpperCase() // Mapear cardType a type para el frontend
        }
      }));
    }

    res.json(collection);
  } catch (error) {
    console.error('Error fetching collection:', error);
    res.status(500).json({ error: 'Error fetching collection' });
  }
};

// POST /api/collections - Crear una nueva colección desde un set
const createCollection = async (req, res) => {
  try {
    const { setId } = req.body;

    if (!setId) {
      return res.status(400).json({ error: 'setId is required' });
    }

    // Verificar que el set existe
    const set = await prisma.set.findUnique({
      where: { id: setId },
      include: {
        cards: true,
        series: true
      }
    });

    if (!set) {
      return res.status(404).json({ error: 'Set not found' });
    }

    // Crear la colección con el nombre del set
    const collection = await prisma.collection.create({
      data: {
        name: set.name, // El nombre es el del set
        description: `${set.series.name} - ${set.cards.length} cartas`,
        type: 'SET',
        setId,
        collectionCards: {
          create: set.cards.map(card => ({
            cardId: card.id,
            quantity: 0
          }))
        }
      },
      include: {
        set: {
          include: {
            series: true
          }
        },
        _count: {
          select: { collectionCards: true }
        }
      }
    });

    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating collection:', error);
    res.status(500).json({ error: 'Error creating collection' });
  }
};

// POST /api/collections/custom - Crear una colección personalizada
const createCustomCollection = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'name is required' });
    }

    // Crear la colección personalizada vacía
    const collection = await prisma.collection.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: 'CUSTOM',
        setId: null
      },
      include: {
        _count: {
          select: { collectionCards: true }
        }
      }
    });

    console.log(`✅ Colección personalizada creada: ${collection.name}`);

    res.status(201).json(collection);
  } catch (error) {
    console.error('Error creating custom collection:', error);
    res.status(500).json({ error: 'Error creating custom collection' });
  }
};

// POST /api/collections/:id/cards - Añadir cartas a una colección personalizada
const addCardsToCollection = async (req, res) => {
  try {
    const { id } = req.params;
    const { cardIds } = req.body; // Array de IDs de cartas

    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return res.status(400).json({ error: 'cardIds array is required' });
    }

    // Verificar que la colección existe y es CUSTOM
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.type !== 'CUSTOM') {
      return res.status(400).json({ error: 'Can only add cards to CUSTOM collections' });
    }

    // Verificar que todas las cartas existen
    const cards = await prisma.card.findMany({
      where: { id: { in: cardIds.map(id => parseInt(id)) } }
    });

    if (cards.length !== cardIds.length) {
      return res.status(404).json({ error: 'Some cards not found' });
    }

    // Añadir cartas que no estén ya en la colección
    const existingCards = await prisma.collectionCard.findMany({
      where: {
        collectionId: parseInt(id),
        cardId: { in: cardIds.map(id => parseInt(id)) }
      }
    });

    const existingCardIds = new Set(existingCards.map(cc => cc.cardId));
    const newCardIds = cardIds.filter(cardId => !existingCardIds.has(parseInt(cardId)));

    if (newCardIds.length === 0) {
      return res.status(200).json({ message: 'All cards already in collection', added: 0 });
    }

    // Crear las nuevas relaciones
    await prisma.collectionCard.createMany({
      data: newCardIds.map(cardId => ({
        collectionId: parseInt(id),
        cardId: parseInt(cardId),
        quantity: 0
      }))
    });

    console.log(`✅ ${newCardIds.length} cartas añadidas a la colección ${collection.name}`);

    res.status(201).json({ 
      message: `${newCardIds.length} cards added to collection`,
      added: newCardIds.length,
      skipped: existingCardIds.size
    });
  } catch (error) {
    console.error('Error adding cards to collection:', error);
    res.status(500).json({ error: 'Error adding cards to collection' });
  }
};

// DELETE /api/collections/:id/cards/:cardId - Eliminar una carta de una colección personalizada
const removeCardFromCollection = async (req, res) => {
  try {
    const { id, cardId } = req.params;

    // Verificar que la colección existe y es CUSTOM
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    if (collection.type !== 'CUSTOM') {
      return res.status(400).json({ error: 'Can only remove cards from CUSTOM collections' });
    }

    // Buscar la relación collection_card
    const collectionCard = await prisma.collectionCard.findFirst({
      where: {
        collectionId: parseInt(id),
        cardId: parseInt(cardId)
      }
    });

    if (!collectionCard) {
      return res.status(404).json({ error: 'Card not found in collection' });
    }

    // Eliminar la relación
    await prisma.collectionCard.delete({
      where: { id: collectionCard.id }
    });

    console.log(`✅ Carta ${cardId} eliminada de la colección ${collection.name}`);

    res.status(204).send();
  } catch (error) {
    console.error('Error removing card from collection:', error);
    res.status(500).json({ error: 'Error removing card from collection' });
  }
};

// PATCH /api/collections/:id/cards/:cardId - Actualizar versiones de una carta
const updateCardQuantity = async (req, res) => {
  try {
    const { id, cardId } = req.params;
    const { quantity, ownedNormal, ownedReverse, ownedHolo, ownedFirstEdition } = req.body;

    // Verificar que la colección y la carta existen
    const collectionCard = await prisma.collectionCard.findFirst({
      where: {
        collectionId: parseInt(id),
        cardId: parseInt(cardId)
      }
    });

    if (!collectionCard) {
      return res.status(404).json({ error: 'Card not found in collection' });
    }

    // Preparar datos para actualizar
    const updateData = {};
    
    // Actualizar las variantes que el usuario posee
    if (ownedNormal !== undefined) {
      updateData.ownedNormal = Boolean(ownedNormal);
    }
    if (ownedReverse !== undefined) {
      updateData.ownedReverse = Boolean(ownedReverse);
    }
    if (ownedHolo !== undefined) {
      updateData.ownedHolo = Boolean(ownedHolo);
    }
    if (ownedFirstEdition !== undefined) {
      updateData.ownedFirstEdition = Boolean(ownedFirstEdition);
    }
    
    // Calcular quantity basado en las versiones que posee
    if (ownedNormal !== undefined || ownedReverse !== undefined || ownedHolo !== undefined || ownedFirstEdition !== undefined) {
      const normal = ownedNormal !== undefined ? Boolean(ownedNormal) : collectionCard.ownedNormal;
      const reverse = ownedReverse !== undefined ? Boolean(ownedReverse) : collectionCard.ownedReverse;
      const holo = ownedHolo !== undefined ? Boolean(ownedHolo) : collectionCard.ownedHolo;
      const firstEd = ownedFirstEdition !== undefined ? Boolean(ownedFirstEdition) : collectionCard.ownedFirstEdition;
      updateData.quantity = (normal ? 1 : 0) + (reverse ? 1 : 0) + (holo ? 1 : 0) + (firstEd ? 1 : 0);
    } else if (quantity !== undefined) {
      // Fallback: si solo se envía quantity (compatibilidad)
      updateData.quantity = parseInt(quantity);
    }

    // Actualizar en la base de datos
    const updated = await prisma.collectionCard.update({
      where: { id: collectionCard.id },
      data: updateData,
      include: {
        card: {
          include: {
            rarity: true,
            set: true
          }
        }
      }
    });

    res.json(updated);
  } catch (error) {
    console.error('Error updating card versions:', error);
    res.status(500).json({ error: 'Error updating card versions' });
  }
};

// DELETE /api/collections/:id - Eliminar una colección
const deleteCollection = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que existe
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id) }
    });

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found' });
    }

    // Primero eliminar todas las collectionCards asociadas
    await prisma.collectionCard.deleteMany({
      where: { collectionId: parseInt(id) }
    });

    // Luego eliminar la colección
    await prisma.collection.delete({
      where: { id: parseInt(id) }
    });

    console.log(`✅ Colección eliminada: ${collection.name}`);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting collection:', error);
    res.status(500).json({ error: 'Error deleting collection' });
  }
};

module.exports = {
  getCollections,
  getCollectionById,
  createCollection,
  createCustomCollection,
  addCardsToCollection,
  removeCardFromCollection,
  updateCardQuantity,
  deleteCollection
};

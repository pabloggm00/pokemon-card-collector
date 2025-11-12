const prisma = require('../config/database');

// Obtener todas las cartas con filtros opcionales
const getAllCards = async (req, res, next) => {
  try {
    const { setId, rarityId, type, pokemonType, search, page = 1, limit = 50 } = req.query;
    
    const skip = (page - 1) * limit;
    
    const where = {};
    if (setId) where.setId = parseInt(setId);
    if (rarityId) where.rarityId = parseInt(rarityId);
    if (type) {
      // TCGdex en inglés usa "Pokemon" (sin acento), "Trainer", "Energy"
      const typeMap = {
        'POKEMON': 'Pokemon',
        'TRAINER': 'Trainer',
        'ENERGY': 'Energy'
      };
      where.cardType = typeMap[type.toUpperCase()] || type;
      
      // Si es una carta Pokémon y hay un tipo de Pokémon especificado, filtrar por él
      if (type.toUpperCase() === 'POKEMON' && pokemonType) {
        // Convertir el tipo a Title Case para coincidir con el formato de la BD
        const formattedType = pokemonType.charAt(0).toUpperCase() + pokemonType.slice(1).toLowerCase();
        where.pokemonType = formattedType;
      }
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { number: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [cards, total] = await Promise.all([
      prisma.card.findMany({
        where,
        include: {
          set: {
            include: {
              series: true
            }
          },
          rarity: true
        },
        skip: parseInt(skip),
        take: parseInt(limit)
      }),
      prisma.card.count({ where })
    ]);

    // Ordenar las cartas por número (convirtiendo a número cuando sea posible)
    const sortedCards = cards.sort((a, b) => {
      const numA = parseInt(a.number);
      const numB = parseInt(b.number);
      
      // Si ambos son números válidos, comparar como números
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Si solo uno es número, el número va primero
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      
      // Si ninguno es número, comparar como strings
      return a.number.localeCompare(b.number);
    });

    const totalPages = Math.ceil(total / limit);
    const hasMore = parseInt(page) < totalPages;

    res.json({
      cards: sortedCards.map(card => ({
        ...card,
        type: card.cardType // Mapear cardType a type para el frontend
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasMore
      }
    });
  } catch (error) {
    next(error);
  }
};

// Obtener una carta por ID
const getCardById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const card = await prisma.card.findUnique({
      where: { id: parseInt(id) },
      include: {
        set: {
          include: {
            series: true
          }
        },
        rarity: true,
        collectionCards: {
          include: {
            collection: true
          }
        }
      }
    });

    if (!card) {
      return res.status(404).json({ error: 'Card not found' });
    }

    res.json(card);
  } catch (error) {
    next(error);
  }
};

// Obtener cartas de un set específico
const getCardsBySet = async (req, res, next) => {
  try {
    const { setId } = req.params;
    
    const cards = await prisma.card.findMany({
      where: { setId: parseInt(setId) },
      include: {
        rarity: true
      }
    });

    // Ordenar las cartas por número
    cards.sort((a, b) => {
      const numA = parseInt(a.number);
      const numB = parseInt(b.number);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      
      return a.number.localeCompare(b.number);
    });

    res.json(cards);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCards,
  getCardById,
  getCardsBySet
};
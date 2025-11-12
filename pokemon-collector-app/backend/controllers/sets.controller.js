const prisma = require('../config/database');

// Obtener todos los sets
const getAllSets = async (req, res, next) => {
  try {
    const { seriesId } = req.query;
    
    const where = seriesId ? { seriesId: parseInt(seriesId) } : {};
    
    const sets = await prisma.set.findMany({
      where,
      include: {
        series: true,
        _count: {
          select: { cards: true }
        }
      },
      orderBy: { releaseDate: 'desc' }
    });

    res.json(sets);
  } catch (error) {
    next(error);
  }
};

// Obtener un set por ID
const getSetById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const set = await prisma.set.findUnique({
      where: { id: parseInt(id) },
      include: {
        series: true,
        cards: {
          include: {
            rarity: true
          }
        }
      }
    });

    if (!set) {
      return res.status(404).json({ error: 'Set not found' });
    }

    // Ordenar las cartas por número (convirtiendo a número cuando sea posible)
    set.cards.sort((a, b) => {
      const numA = parseInt(a.number);
      const numB = parseInt(b.number);
      
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      if (!isNaN(numA)) return -1;
      if (!isNaN(numB)) return 1;
      
      return a.number.localeCompare(b.number);
    });

    res.json(set);
  } catch (error) {
    next(error);
  }
};

// Eliminar un set
const deleteSet = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar si el set existe y obtener información para el log
    const set = await prisma.set.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: { 
            cards: true,
            collections: true
          }
        }
      }
    });

    if (!set) {
      return res.status(404).json({ error: 'Set no encontrado' });
    }

    // Con onDelete: Cascade configurado, solo necesitamos borrar el set
    // PostgreSQL borrará automáticamente: cards -> collections -> collection_cards
    await prisma.set.delete({
      where: { id: parseInt(id) }
    });

    console.log(`✅ Set eliminado: ${set.name} (${set._count.cards} cartas, ${set._count.collections} colecciones)`);

    res.json({ 
      message: 'Set eliminado exitosamente',
      deletedCards: set._count.cards,
      deletedCollections: set._count.collections
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSets,
  getSetById,
  deleteSet
};
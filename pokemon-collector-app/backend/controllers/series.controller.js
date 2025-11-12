const prisma = require('../config/database');

// Obtener todas las series
const getAllSeries = async (req, res, next) => {
  try {
    const series = await prisma.series.findMany({
      include: {
        sets: {
          select: {
            id: true,
            name: true,
            code: true,
            totalCards: true
          }
        }
      },
      orderBy: { releaseDate: 'desc' }
    });

    res.json(series);
  } catch (error) {
    next(error);
  }
};

// Obtener una serie por ID
const getSeriesById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const series = await prisma.series.findUnique({
      where: { id: parseInt(id) },
      include: {
        sets: {
          include: {
            _count: {
              select: { cards: true }
            }
          }
        }
      }
    });

    if (!series) {
      return res.status(404).json({ error: 'Series not found' });
    }

    res.json(series);
  } catch (error) {
    next(error);
  }
};

// Eliminar una serie
const deleteSeries = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Verificar que la serie existe
    const series = await prisma.series.findUnique({
      where: { id: parseInt(id) },
      include: {
        sets: {
          include: {
            _count: {
              select: { cards: true }
            }
          }
        }
      }
    });

    if (!series) {
      return res.status(404).json({ error: 'Serie no encontrada' });
    }

    // Contar total de cartas en todos los sets de la serie
    const totalCards = series.sets.reduce((sum, set) => sum + set._count.cards, 0);

    // Con onDelete: Cascade configurado, solo necesitamos borrar la serie
    // PostgreSQL borrará automáticamente: sets -> cards -> collections -> collection_cards
    await prisma.series.delete({
      where: { id: parseInt(id) }
    });

    res.json({ 
      message: 'Serie eliminada exitosamente',
      deletedSets: series.sets.length,
      deletedCards: totalCards
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSeries,
  getSeriesById,
  deleteSeries
};
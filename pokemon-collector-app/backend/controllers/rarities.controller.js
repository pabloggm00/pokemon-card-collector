const prisma = require('../config/database');

// Obtener todas las rarezas
const getAllRarities = async (req, res, next) => {
  try {
    const rarities = await prisma.rarity.findMany({
      orderBy: { order: 'asc' }
    });

    res.json(rarities);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllRarities
};
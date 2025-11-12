const { PrismaClient } = require('@prisma/client');
const { get } = require('../app');
const TCGdex = require('@tcgdex/sdk').default;

const prisma = new PrismaClient();
const tcgdex = new TCGdex('en'); // SDK en inglés para valores canónicos

// GET /api/import/available-sets - Obtener lista de sets disponibles para importar
const getAvailableSets = async (req, res) => {
  try {
    console.log('📋 Obteniendo lista de sets disponibles...');
    
    // Obtener todos los sets desde TCGdex
    const sets = await tcgdex.set.list();
    
    console.log(`✅ ${sets.length} sets disponibles en TCGdex`);
    
    // Obtener los sets que ya están en la base de datos
    const existingSets = await prisma.set.findMany({
      select: { apiId: true }
    });
    
    const existingSetIds = new Set(existingSets.map(set => set.apiId));
    console.log(`📦 ${existingSetIds.size} sets ya importados`);
    
    // Filtrar sets que NO están en la base de datos
    const availableSets = sets.filter(set => !existingSetIds.has(set.id));
    
    console.log(`✅ ${availableSets.length} sets disponibles para importar`);
    
    // Formatear respuesta para el frontend
    const formattedSets = availableSets.map(set => ({
      id: set.id,
      name: set.name,
      cardCount: set.cardCount?.total || 0,
      logo: set.logo ? `${set.logo}.webp` : null
    }));
    
    res.json(formattedSets);
  } catch (error) {
    console.error('❌ Error obteniendo sets disponibles:', error);
    res.status(500).json({ 
      error: 'Error al obtener sets disponibles',
      details: error.message
    });
  }
};

// POST /api/import/set - Importar un set desde TCGdex
const importSetFromAPI = async (req, res) => {
  let createdSeriesId = null;
  let createdSetId = null;
  let seriesWasNew = false;
  
  try {
    const { setId } = req.body; // ej: "sv1", "swsh3"

    if (!setId) {
      return res.status(400).json({ error: 'Se requiere el ID del set' });
    }

    console.log(`🔍 Buscando set con ID: ${setId}`);

    // Obtener set completo desde TCGdex (incluye todas las cartas)
    const setData = await tcgdex.set.get(setId);
    
    if (!setData) {
      return res.status(404).json({ error: 'Set no encontrado en TCGdex' });
    }
    
    console.log(`✅ Set encontrado: ${setData.name}`);
    console.log(`📦 Serie: ${setData.serie.name}`);
    console.log(`🃏 Total de cartas: ${setData.cardCount.total}`);
    console.log(`🖼️  Logo URL: ${setData.logo}`);
    console.log(`🎨 Symbol URL: ${setData.symbol}`);

    // Verificar si el set ya existe
    const existingSet = await prisma.set.findUnique({
      where: { apiId: setData.id }
    });

    if (existingSet) {
      return res.status(409).json({ 
        error: 'Este set ya existe en la base de datos',
        set: existingSet
      });
    }

    // Buscar o crear la serie
    const seriesCode = setData.serie.id.toUpperCase();
    
    let series = await prisma.series.findUnique({
      where: { code: seriesCode }
    });

    if (!series) {
      console.log(`🆕 Creando nueva serie: ${setData.serie.name}`);
      
      // Obtener info completa de la serie desde TCGdex
      const serieData = await tcgdex.serie.get(setData.serie.id);
      
      series = await prisma.series.create({
        data: {
          name: setData.serie.name,
          code: seriesCode,
          releaseDate: new Date(setData.releaseDate),
          logoUrl: serieData.logo ? `${serieData.logo}.webp` : null
        }
      });
      
      createdSeriesId = series.id;
      seriesWasNew = true;
      console.log(`✅ Serie creada: ${series.name} (${series.code})`);
    }

    // Crear el set
    const newSet = await prisma.set.create({
      data: {
        name: setData.name,
        code: setData.id.toUpperCase(),
        apiId: setData.id,
        seriesId: series.id,
        releaseDate: new Date(setData.releaseDate),
        totalCards: setData.cardCount.total,
        logoUrl: setData.logo ? `${setData.logo}.webp` : null,
        symbolUrl: setData.symbol ? `${setData.symbol}.webp` : null
      },
      include: {
        series: true
      }
    });

    createdSetId = newSet.id;
    console.log(`✅ Set creado: ${newSet.name}`);

    // Importar las cartas del set
    console.log(`\n🃏 Obteniendo cartas del set...`);
    const fullCards = await Promise.all(
      setData.cards.map(cardResume => cardResume.getCard())
    );
    
    console.log(`🃏 Importando ${fullCards.length} cartas...`);
    await importCardsFromSet(fullCards, newSet.id);

    res.status(201).json({
      message: 'Set y cartas importados exitosamente',
      set: newSet
    });

  } catch (error) {
    console.error('❌ Error importando set:', error);
    
    // ROLLBACK: Limpiar lo que se creó si hubo error
    try {
      if (createdSetId) {
        console.log('🔄 Rollback: Eliminando set creado...');
        await prisma.card.deleteMany({ where: { setId: createdSetId } });
        await prisma.set.delete({ where: { id: createdSetId } });
        console.log('✅ Set eliminado');
      }
      
      if (seriesWasNew && createdSeriesId) {
        const setsInSeries = await prisma.set.count({
          where: { seriesId: createdSeriesId }
        });
        
        if (setsInSeries === 0) {
          console.log('🔄 Rollback: Eliminando serie creada...');
          await prisma.series.delete({ where: { id: createdSeriesId } });
          console.log('✅ Serie eliminada');
        }
      }
    } catch (rollbackError) {
      console.error('❌ Error en rollback:', rollbackError);
    }
    
    res.status(500).json({ 
      error: 'Error importando set desde TCGdex',
      details: error.message
    });
  }
};

// Generar color HEX
function generateRarityColor(name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  // Convertir a HEX
  const color = (hash & 0x00FFFFFF).toString(16).toUpperCase();
  return `#${'00000'.substring(0, 6 - color.length)}${color}`;
}

// Función auxiliar para importar cartas desde TCGdex
async function importCardsFromSet(cards, setId) {
  try {
    let totalImported = 0;

    for (const card of cards) {
      try {
        // Buscar o crear la rareza
        const rarityName = card.rarity || 'Common';
        
        let rarity = await prisma.rarity.findFirst({
          where: { name: rarityName }
        });
        
        if (!rarity) {
          // Obtener el último order
          const maxOrderResult = await prisma.rarity.aggregate({
            _max: {
              order: true
            }
          });
          
          const nextOrder = (maxOrderResult._max.order || 0) + 1;

          const rarityCode = rarityName.replace(/\s+/g, '').substring(0, 10).toUpperCase();
          
          rarity = await prisma.rarity.upsert({
            where: { code: rarityCode },
            update: {},
            create: {
              name: rarityName,
              code: rarityCode,
              description: rarityName + ' card',
              colorHex: generateRarityColor(rarityName),
              order: nextOrder
            }
          });
        }

        // Determinar el tipo de carta
        const cardType = card.category || 'Pokemon';
        
        // Determinar subtipo (Stage 1, Basic, VMAX, etc.)
        const subtype = card.stage || card.suffix || null;
        
        // Crear la carta - URLs en inglés
        const imageUrl = `${card.image}/low.webp`;
        const largeImageUrl = `${card.image}/high.webp`;
        
        // Extraer variantes desde la API
        const variants = card.variants || {};
        
        await prisma.card.create({
          data: {
            number: card.localId,
            name: card.name,
            setId: setId,
            rarityId: rarity.id,
            cardType: cardType,
            subtype: subtype,
            pokemonType: card.types ? card.types.join(',') : null,
            artist: card.illustrator || null,
            imageUrl: imageUrl,
            largeImageUrl: largeImageUrl,
            // Variantes disponibles de la carta
            hasNormalVariant: variants.normal || false,
            hasReverseVariant: variants.reverse || false,
            hasHoloVariant: variants.holo || false,
            hasFirstEditionVariant: variants.firstEdition || false
          }
        });

        totalImported++;
        
        if (totalImported % 50 === 0) {
          console.log(`   📊 Progreso: ${totalImported}/${cards.length} cartas`);
        }
      } catch (error) {
        console.error(`⚠️  Error importando carta ${card.localId}:`, error.message);
      }
    }

    console.log(`✅ ${totalImported} cartas importadas exitosamente`);
    
  } catch (error) {
    console.error('❌ Error importando cartas:', error);
    throw error;
  }
}

module.exports = {
  getAvailableSets,
  importSetFromAPI
};

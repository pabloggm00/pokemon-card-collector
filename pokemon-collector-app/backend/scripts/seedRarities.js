const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const rarities = [
  { name: 'Common', code: 'COMMON', description: 'Common card', colorHex: '#FF6B35', order: 1 },
  { name: 'Uncommon', code: 'UNCOMMON', description: 'Uncommon card', colorHex: '#2C7A2C', order: 2 },
  { name: 'Rare', code: 'RARE', description: 'Rare card', colorHex: '#4A4A4A', order: 3 },
  { name: 'Rare Holo', code: 'RAREHOLO', description: 'Rare Holo card', colorHex: '#1E88E5', order: 4 },
  { name: 'None', code: 'NONE', description: 'None card', colorHex: '#5E35B1', order: 5 },
  { name: 'Ultra Rare', code: 'ULTRARARE', description: 'Ultra Rare card', colorHex: '#3949AB', order: 6 },
  { name: 'Rare Holo LV.X', code: 'RAREHOLOLV', description: 'Rare Holo LV.X card', colorHex: '#00897B', order: 7 },
  { name: 'Rare PRIME', code: 'RAREPRIME', description: 'Rare PRIME card', colorHex: '#43A047', order: 8 },
  { name: 'LEGEND', code: 'LEGEND', description: 'LEGEND card', colorHex: '#7CB342', order: 9 },
  { name: 'Secret Rare', code: 'SECRETRARE', description: 'Secret Rare card', colorHex: '#FDD835', order: 10 },
  { name: 'Holo Rare V', code: 'HOLORAREV', description: 'Holo Rare V card', colorHex: '#FFB300', order: 11 },
  { name: 'Holo Rare', code: 'HOLORARE', description: 'Holo Rare card', colorHex: '#FB8C00', order: 12 },
  { name: 'Holo Rare VMAX', code: 'HOLORAREVM', description: 'Holo Rare VMAX card', colorHex: '#F4511E', order: 13 },
  { name: 'Amazing Rare', code: 'AMAZINGRAR', description: 'Amazing Rare card', colorHex: '#E53935', order: 14 },
  { name: 'Shiny rare', code: 'SHINYRARE', description: 'Shiny rare card', colorHex: '#D81B60', order: 15 },
  { name: 'Shiny rare V', code: 'SHINYRAREV', description: 'Shiny rare V card', colorHex: '#8E24AA', order: 16 },
  { name: 'Shiny rare VMAX', code: 'SHINYRAREVM', description: 'Shiny rare VMAX card', colorHex: '#5E35B1', order: 17 },
  { name: 'Classic Collection', code: 'CLASSICCOL', description: 'Classic Collection card', colorHex: '#3949AB', order: 18 },
  { name: 'Holo Rare VSTAR', code: 'HOLORAREVS', description: 'Holo Rare VSTAR card', colorHex: '#1A237E', order: 19 },
  { name: 'Radiant Rare', code: 'RADIANTRAR', description: 'Radiant Rare card', colorHex: '#0D47A1', order: 20 },
  { name: 'Full Art Trainer', code: 'FULLARTTRA', description: 'Full Art Trainer card', colorHex: '#01579B', order: 21 },
  { name: 'Double rare', code: 'DOUBLERARE', description: 'Double rare card', colorHex: '#004D40', order: 22 },
  { name: 'Illustration rare', code: 'ILLUSTRATI', description: 'Illustration rare card', colorHex: '#00695C', order: 23 },
  { name: 'Special illustration rare', code: 'SPECIALILL', description: 'Special illustration rare card', colorHex: '#00796B', order: 24 },
  { name: 'Hyper rare', code: 'HYPERRARE', description: 'Hyper rare card', colorHex: '#BF360C', order: 25 },
  { name: 'Shiny Ultra Rare', code: 'SHINYULTRA', description: 'Shiny Ultra Rare card', colorHex: '#DD2C00', order: 26 },
  { name: 'ACE SPEC Rare', code: 'ACESPECRAR', description: 'ACE SPEC Rare card', colorHex: '#FF3D00', order: 27 },
  { name: 'One Diamond', code: 'ONEDIAMOND', description: 'One Diamond card', colorHex: '#FFD600', order: 28 },
  { name: 'Two Diamond', code: 'TWODIAMOND', description: 'Two Diamond card', colorHex: '#FFAB00', order: 29 },
  { name: 'Three Diamond', code: 'THREEDIAMO', description: 'Three Diamond card', colorHex: '#FF6D00', order: 30 },
  { name: 'Four Diamond', code: 'FOURDIAMON', description: 'Four Diamond card', colorHex: '#C51162', order: 31 },
  { name: 'One Star', code: 'ONESTAR', description: 'One Star card', colorHex: '#AA00FF', order: 32 },
  { name: 'Two Star', code: 'TWOSTAR', description: 'Two Star card', colorHex: '#6200EA', order: 33 },
  { name: 'Three Star', code: 'THREESTAR', description: 'Three Star card', colorHex: '#212121', order: 34 },
  { name: 'Crown', code: 'CROWN', description: 'Crown card', colorHex: '#000000', order: 35 },
  { name: 'One Shiny', code: 'ONESHINY', description: 'One Shiny card', colorHex: '#FFFFFF', order: 36 },
  { name: 'Two Shiny', code: 'TWOSHINY', description: 'Two Shiny card', colorHex: '#4A4A4A', order: 37 },
  { name: 'Black White Rare', code: 'BLACKWHITE', description: 'Black White Rare card', colorHex: '#2C7A2C', order: 38 },
  { name: 'Mega Hyper Rare', code: 'MEGAHYPERR', description: 'Mega Hyper Rare card', colorHex: '#FF6B35', order: 39 }
];

async function seedIfEmpty() {
  try {
    console.log('Verificando si la tabla de rarezas está vacía...');
    
    // Contar cuántas rarezas existen
    const count = await prisma.rarity.count();
    
    if (count === 0) {
      console.log('La tabla está vacía. Insertando rarezas...');
      await prisma.rarity.createMany({
        data: rarities,
      });
      console.log('Rarezas insertadas correctamente');
    } else {
      console.log(`La tabla ya tiene ${count} rarezas. No se inserta nada.`);
    }
    
  } catch (error) {
    console.error('Error:', error);
    // No hacemos exit(1) para que el servidor arranque igual
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar automáticamente
seedIfEmpty();
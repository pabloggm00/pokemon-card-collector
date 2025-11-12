#!/usr/bin/env node
/**
 * Script para resetear la base de datos
 * Elimina la DB actual y la recrea con Prisma
 * Ejecuta el seed para crear las rarezas base
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../prisma/pokemon-collection.db');

console.log('🗑️  Reseteando base de datos...');

// Paso 1: Eliminar base de datos existente
try {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('✅ Base de datos eliminada');
  }
  
  if (fs.existsSync(DB_PATH + '-journal')) {
    fs.unlinkSync(DB_PATH + '-journal');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}

// Paso 2: Recrear base de datos
console.log('🔄 Recreando estructura...');
exec('npx prisma db push', { cwd: path.join(__dirname, '..') }, (error) => {
  if (error) {
    console.error('❌ Error recreando base de datos');
    process.exit(1);
  }
  
  // Paso 3: Ejecutar seed para crear rarezas
  console.log('🌱 Creando rarezas base...');
  exec('npm run seed', { cwd: path.join(__dirname, '..') }, (seedError) => {
    if (seedError) {
      console.error('❌ Error ejecutando seed');
      process.exit(1);
    }
    
    console.log('🎉 Base de datos lista!');
    console.log('💡 Importa sets desde la UI');
  });
});

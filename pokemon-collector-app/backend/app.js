const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { errorHandler, notFound } = require('./middleware/error.middleware');

// Importar rutas
const seriesRoutes = require('./routes/series.routes');
const setsRoutes = require('./routes/sets.routes');
const cardsRoutes = require('./routes/cards.routes');
const raritiesRoutes = require('./routes/rarities.routes');
const collectionRoutes = require('./routes/collection.routes');
const importRoutes = require('./routes/import.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rutas
app.get('/', (req, res) => {
  res.json({
    message: 'Pokemon Card Collector API',
    version: '1.0.0',
    endpoints: {
      series: '/api/series',
      sets: '/api/sets',
      cards: '/api/cards',
      rarities: '/api/rarities',
      collections: '/api/collections'
    }
  });
});

// API Routes
app.use('/api/series', seriesRoutes);
app.use('/api/sets', setsRoutes);
app.use('/api/cards', cardsRoutes);
app.use('/api/rarities', raritiesRoutes);
app.use('/api/collections', collectionRoutes);
app.use('/api/import', importRoutes);

// Middleware de errores (debe ir al final)
app.use(notFound);
app.use(errorHandler);

module.exports = app;
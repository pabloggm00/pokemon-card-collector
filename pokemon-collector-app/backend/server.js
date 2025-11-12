const app = require('./app');

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🎴 Pokemon Card Collector API Server     ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log('');
  console.log('Available endpoints:');
  console.log(`   📦 Series:      http://localhost:${PORT}/api/series`);
  console.log(`   🎴 Sets:        http://localhost:${PORT}/api/sets`);
  console.log(`   🃏 Cards:       http://localhost:${PORT}/api/cards`);
  console.log(`   ⭐ Rarities:    http://localhost:${PORT}/api/rarities`);
  console.log(`   📚 Collections: http://localhost:${PORT}/api/collections`);
  console.log('');
  console.log('Press CTRL+C to stop the server');
  console.log('═════════════════════════════════════════════════');
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
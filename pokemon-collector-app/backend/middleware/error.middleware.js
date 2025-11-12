// Middleware para manejar errores de forma centralizada
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // Error de Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        return res.status(409).json({
          error: 'Conflict',
          message: 'A record with this unique field already exists'
        });
      case 'P2025':
        return res.status(404).json({
          error: 'Not Found',
          message: 'Record not found'
        });
      case 'P2003':
        return res.status(400).json({
          error: 'Bad Request',
          message: 'Foreign key constraint failed'
        });
      default:
        return res.status(500).json({
          error: 'Database Error',
          message: err.message
        });
    }
  }

  // Errores de validación
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message
    });
  }

  // Error por defecto
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.name || 'Internal Server Error',
    message: err.message || 'Something went wrong'
  });
};

// Middleware para rutas no encontradas
const notFound = (req, res, next) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = { errorHandler, notFound };
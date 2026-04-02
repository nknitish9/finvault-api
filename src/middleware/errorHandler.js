const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const env = require('../config/environment');

/**
 * Global error handling middleware.
 * Must be defined with 4 parameters so Express recognizes it as an error handler.
 *
 * Handles:
 * - ApiError instances (operational errors with status codes)
 * - Unexpected errors (logged and returned as 500)
 */
function errorHandler(err, req, res, next) {
  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Log unexpected (non-operational) errors
  if (!err.isOperational) {
    console.error('─── UNEXPECTED ERROR ───');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Route:', req.method, req.originalUrl);
    console.error('Error:', err);
    console.error('────────────────────────');

    // Don't leak error details in production
    if (env.NODE_ENV === 'production') {
      message = 'Internal Server Error';
      errors = [];
    }
  }

  // Handle specific error types
  if (err.name === 'SyntaxError' && err.status === 400) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  return ApiResponse.error(res, {
    statusCode,
    message,
    errors,
  });
}

module.exports = errorHandler;

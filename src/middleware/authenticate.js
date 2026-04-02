const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const { db } = require('../config/database');
const ApiError = require('../utils/ApiError');

/**
 * Authentication middleware.
 * Extracts and verifies JWT from the Authorization header,
 * then attaches the full user object to req.user.
 */
function authenticate(req, res, next) {
  try {
    // Extract token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Access denied — No token provided');
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      throw ApiError.unauthorized('Access denied — Malformed authorization header');
    }

    // Verify token
    const decoded = jwt.verify(token, env.JWT_SECRET);

    // Fetch user from database to ensure they still exist and are active
    const user = db.prepare(
      'SELECT id, username, email, full_name, role, is_active FROM users WHERE id = ?'
    ).get(decoded.id);

    if (!user) {
      throw ApiError.unauthorized('Access denied — User no longer exists');
    }

    if (!user.is_active) {
      throw ApiError.forbidden('Account is deactivated — Contact an administrator');
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }

    if (error.name === 'JsonWebTokenError') {
      return next(ApiError.unauthorized('Access denied — Invalid token'));
    }

    if (error.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access denied — Token has expired'));
    }

    return next(ApiError.unauthorized('Access denied — Authentication failed'));
  }
}

module.exports = authenticate;

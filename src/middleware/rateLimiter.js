const rateLimit = require('express-rate-limit');

/**
 * General rate limiter — applied to all routes.
 * 100 requests per 15-minute window per IP.
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests — please try again after 15 minutes',
  },
});

/**
 * Strict rate limiter for authentication routes.
 * 20 requests per 15-minute window per IP.
 * Prevents brute-force login attempts.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts — please try again after 15 minutes',
  },
});

module.exports = { generalLimiter, authLimiter };

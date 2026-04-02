const ApiError = require('../utils/ApiError');

/**
 * Authorization middleware factory.
 * Returns a middleware that checks if the authenticated user's role
 * is included in the list of allowed roles.
 *
 * Usage:
 *   router.post('/records', authenticate, authorize('admin'), controller.create);
 *   router.get('/dashboard', authenticate, authorize('admin', 'analyst'), controller.summary);
 *
 * @param  {...string} allowedRoles - Roles permitted to access the route
 * @returns {Function} Express middleware
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    // authenticate middleware must run before authorize
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required before authorization'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Access denied — Role '${req.user.role}' is not authorized. Required: ${allowedRoles.join(', ')}`
        )
      );
    }

    next();
  };
}

module.exports = authorize;

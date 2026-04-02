const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Validation middleware.
 * Runs after express-validator chain and collects any validation errors.
 * If errors exist, throws a structured ApiError with field-level details.
 *
 * Usage:
 *   router.post('/records',
 *     [...recordValidators],   // express-validator rules
 *     validate,                // this middleware
 *     controller.create
 *   );
 */
function validate(req, res, next) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    throw ApiError.badRequest('Validation failed', formattedErrors);
  }

  next();
}

module.exports = validate;

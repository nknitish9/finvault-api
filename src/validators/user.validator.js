const { body } = require('express-validator');
const { ROLES } = require('../utils/constants');

const updateRoleValidator = [
  body('role')
    .trim()
    .notEmpty().withMessage('Role is required')
    .isIn(Object.values(ROLES)).withMessage(`Role must be one of: ${Object.values(ROLES).join(', ')}`),
];

const updateStatusValidator = [
  body('is_active')
    .notEmpty().withMessage('is_active flag is required')
    .isBoolean().withMessage('is_active must be a boolean (true/false)'),
];

module.exports = {
  updateRoleValidator,
  updateStatusValidator,
};

const { body, query } = require('express-validator');
const { RECORD_TYPES, CATEGORIES } = require('../utils/constants');

const createRecordValidator = [
  body('type')
    .trim()
    .notEmpty().withMessage('Type is required')
    .isIn(Object.values(RECORD_TYPES)).withMessage(`Type must be one of: ${Object.values(RECORD_TYPES).join(', ')}`),

  body('category')
    .trim()
    .notEmpty().withMessage('Category is required')
    .toLowerCase()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('amount')
    .notEmpty().withMessage('Amount is required')
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),

  body('description')
    .optional()
    .trim()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('date')
    .notEmpty().withMessage('Date is required')
    .isISO8601().withMessage('Date must be a valid ISO 8601 format (YYYY-MM-DD)'),
];

const updateRecordValidator = [
  body('type')
    .optional()
    .trim()
    .isIn(Object.values(RECORD_TYPES)).withMessage(`Type must be one of: ${Object.values(RECORD_TYPES).join(', ')}`),

  body('category')
    .optional()
    .trim()
    .toLowerCase()
    .isIn(CATEGORIES).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),

  body('amount')
    .optional()
    .isFloat({ gt: 0 }).withMessage('Amount must be a positive number'),

  body('description')
    .optional()
    .trim()
    .isString().withMessage('Description must be a string')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),

  body('date')
    .optional()
    .isISO8601().withMessage('Date must be a valid ISO 8601 format (YYYY-MM-DD)'),
];

const getRecordsQueryValidator = [
  query('type')
    .optional()
    .isIn(Object.values(RECORD_TYPES)).withMessage('Invalid type query parameter'),
    
  query('category')
    .optional()
    .toLowerCase()
    .isIn(CATEGORIES).withMessage('Invalid category query parameter'),
    
  query('startDate')
    .optional()
    .isISO8601().withMessage('Invalid startDate format'),
    
  query('endDate')
    .optional()
    .isISO8601().withMessage('Invalid endDate format'),
    
  query('minAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('minAmount must be a positive number'),
    
  query('maxAmount')
    .optional()
    .isFloat({ min: 0 }).withMessage('maxAmount must be a positive number'),
    
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    
  query('limit')
    .optional()
    .isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
];

module.exports = {
  createRecordValidator,
  updateRecordValidator,
  getRecordsQueryValidator,
};

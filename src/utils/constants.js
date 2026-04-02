/**
 * Application-wide constants and enums.
 */

const ROLES = {
  ADMIN: 'admin',
  ANALYST: 'analyst',
  VIEWER: 'viewer',
};

const RECORD_TYPES = {
  INCOME: 'income',
  EXPENSE: 'expense',
};

const CATEGORIES = [
  'salary',
  'freelance',
  'investments',
  'rental',
  'business',
  'food',
  'transportation',
  'utilities',
  'entertainment',
  'healthcare',
  'education',
  'shopping',
  'rent',
  'insurance',
  'taxes',
  'other',
];

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

module.exports = {
  ROLES,
  RECORD_TYPES,
  CATEGORIES,
  PAGINATION,
};

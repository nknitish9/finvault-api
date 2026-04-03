const Record = require('../models/Record');
const ApiError = require('../utils/ApiError');
const { RECORD_TYPES, PAGINATION } = require('../utils/constants');

/**
 * Record Service — Handles financial record business logic.
 */
class RecordService {
  /**
   * Create a new financial record.
   * @param {object} data - Record data
   * @param {number} userId - ID of the user creating the record
   * @returns {object} Created record
   */
  static createRecord(data, userId) {
    const { type, category, amount, description, date } = data;

    // Validate record type
    const validTypes = Object.values(RECORD_TYPES);
    if (!validTypes.includes(type)) {
      throw ApiError.badRequest(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
    }

    const record = Record.create({
      user_id: userId,
      type,
      category: category.toLowerCase(),
      amount: parseFloat(amount),
      description: description || '',
      date,
    });

    return record;
  }

  /**
   * Get all records with filters and pagination.
   * @param {object} query - Filter parameters
   * @returns {object} { records, total, page, limit, totalPages }
   */
  static getRecords(query = {}) {
    const filters = {
      type: query.type,
      category: query.category,
      startDate: query.startDate,
      endDate: query.endDate,
      minAmount: query.minAmount ? parseFloat(query.minAmount) : undefined,
      maxAmount: query.maxAmount ? parseFloat(query.maxAmount) : undefined,
      search: query.search,
      sortBy: query.sortBy || 'date',
      sortOrder: query.sortOrder || 'desc',
      page: Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE),
      limit: Math.min(
        PAGINATION.MAX_LIMIT,
        Math.max(1, parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT)
      ),
    };

    return Record.findAll(filters);
  }

  /**
   * Get a single record by ID.
   * @param {number} id
   * @returns {object} Record
   */
  static getRecordById(id) {
    const record = Record.findById(id);

    if (!record) {
      throw ApiError.notFound(`Financial record with ID ${id} not found`);
    }

    return record;
  }

  /**
   * Update a financial record.
   * @param {number} id - Record ID
   * @param {object} data - Fields to update
   * @returns {object} Updated record
   */
  static updateRecord(id, data) {
    // Check if record exists
    const existing = Record.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Financial record with ID ${id} not found`);
    }

    // Validate type if being updated
    if (data.type) {
      const validTypes = Object.values(RECORD_TYPES);
      if (!validTypes.includes(data.type)) {
        throw ApiError.badRequest(`Invalid type. Must be one of: ${validTypes.join(', ')}`);
      }
    }

    // Normalize category
    if (data.category) {
      data.category = data.category.toLowerCase();
    }

    // Parse amount
    if (data.amount !== undefined) {
      data.amount = parseFloat(data.amount);
    }

    const record = Record.update(id, data);

    if (!record) {
      throw ApiError.notFound(`Financial record with ID ${id} not found`);
    }

    return record;
  }

  /**
   * Soft-delete a financial record.
   * @param {number} id
   * @returns {boolean}
   */
  static deleteRecord(id) {
    // Check if record exists
    const existing = Record.findById(id);
    if (!existing) {
      throw ApiError.notFound(`Financial record with ID ${id} not found`);
    }

    return Record.softDelete(id);
  }
}

module.exports = RecordService;

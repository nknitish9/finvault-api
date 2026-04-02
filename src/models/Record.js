const { db } = require('../config/database');

/**
 * Record Model — Data Access Layer
 * Handles all database operations for the financial_records table.
 * Implements soft delete — all queries exclude soft-deleted records by default.
 */
class Record {
  /**
   * Create a new financial record.
   * @param {object} data - { user_id, type, category, amount, description, date }
   * @returns {object} The created record
   */
  static create({ user_id, type, category, amount, description = '', date }) {
    const stmt = db.prepare(`
      INSERT INTO financial_records (user_id, type, category, amount, description, date)
      VALUES (@user_id, @type, @category, @amount, @description, @date)
    `);

    const result = stmt.run({ user_id, type, category, amount, description, date });
    return Record.findById(result.lastInsertRowid);
  }

  /**
   * Find a record by ID (excludes soft-deleted).
   * @param {number} id
   * @returns {object|undefined}
   */
  static findById(id) {
    return db.prepare(`
      SELECT r.*, u.username as created_by
      FROM financial_records r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ? AND r.is_deleted = 0
    `).get(id);
  }

  /**
   * Get all records with dynamic filtering, sorting, and pagination.
   * @param {object} filters
   * @param {string}  [filters.type]       - 'income' or 'expense'
   * @param {string}  [filters.category]   - Category name
   * @param {string}  [filters.startDate]  - Start date (ISO format)
   * @param {string}  [filters.endDate]    - End date (ISO format)
   * @param {number}  [filters.minAmount]  - Minimum amount
   * @param {number}  [filters.maxAmount]  - Maximum amount
   * @param {string}  [filters.search]     - Search in description
   * @param {string}  [filters.sortBy]     - Column to sort by (default: 'date')
   * @param {string}  [filters.sortOrder]  - 'asc' or 'desc' (default: 'desc')
   * @param {number}  [filters.page]       - Page number (default: 1)
   * @param {number}  [filters.limit]      - Records per page (default: 20)
   * @returns {object} { records, total, page, limit, totalPages }
   */
  static findAll(filters = {}) {
    const {
      type,
      category,
      startDate,
      endDate,
      minAmount,
      maxAmount,
      search,
      sortBy = 'date',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
    } = filters;

    // Build WHERE clauses dynamically
    const conditions = ['r.is_deleted = 0'];
    const params = [];

    if (type) {
      conditions.push('r.type = ?');
      params.push(type);
    }

    if (category) {
      conditions.push('r.category = ?');
      params.push(category);
    }

    if (startDate) {
      conditions.push('r.date >= ?');
      params.push(startDate);
    }

    if (endDate) {
      conditions.push('r.date <= ?');
      params.push(endDate);
    }

    if (minAmount !== undefined && minAmount !== null) {
      conditions.push('r.amount >= ?');
      params.push(minAmount);
    }

    if (maxAmount !== undefined && maxAmount !== null) {
      conditions.push('r.amount <= ?');
      params.push(maxAmount);
    }

    if (search) {
      conditions.push('r.description LIKE ?');
      params.push(`%${search}%`);
    }

    const whereClause = conditions.join(' AND ');

    // Whitelist sortable columns to prevent SQL injection
    const allowedSortColumns = ['date', 'amount', 'type', 'category', 'created_at'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? sortBy : 'date';
    const safeSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    // Get total count
    const countRow = db.prepare(
      `SELECT COUNT(*) as total FROM financial_records r WHERE ${whereClause}`
    ).get(...params);

    const total = countRow.total;
    const offset = (page - 1) * limit;

    // Get paginated records
    const records = db.prepare(`
      SELECT r.*, u.username as created_by
      FROM financial_records r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE ${whereClause}
      ORDER BY r.${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `).all(...params, limit, offset);

    return {
      records,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update a financial record.
   * @param {number} id
   * @param {object} data - Fields to update
   * @returns {object|undefined} Updated record
   */
  static update(id, data) {
    const allowedFields = ['type', 'category', 'amount', 'description', 'date'];
    const updates = [];
    const params = [];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (updates.length === 0) return Record.findById(id);

    updates.push("updated_at = datetime('now')");
    params.push(id);

    const result = db.prepare(`
      UPDATE financial_records
      SET ${updates.join(', ')}
      WHERE id = ? AND is_deleted = 0
    `).run(...params);

    if (result.changes === 0) return undefined;
    return Record.findById(id);
  }

  /**
   * Soft-delete a record (sets is_deleted = 1).
   * @param {number} id
   * @returns {boolean} True if a record was soft-deleted
   */
  static softDelete(id) {
    const result = db.prepare(`
      UPDATE financial_records
      SET is_deleted = 1, updated_at = datetime('now')
      WHERE id = ? AND is_deleted = 0
    `).run(id);

    return result.changes > 0;
  }

  // ─── Aggregation Methods (Dashboard) ─────────────────────────────────────────

  /**
   * Get financial summary: total income, total expenses, net balance.
   * @returns {object} { total_income, total_expenses, net_balance, record_count }
   */
  static getSummary() {
    const result = db.prepare(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as net_balance,
        COUNT(*) as record_count
      FROM financial_records
      WHERE is_deleted = 0
    `).get();

    return {
      total_income: Math.round(result.total_income * 100) / 100,
      total_expenses: Math.round(result.total_expenses * 100) / 100,
      net_balance: Math.round(result.net_balance * 100) / 100,
      record_count: result.record_count,
    };
  }

  /**
   * Get totals grouped by category.
   * @returns {Array} [{ category, type, total, count }]
   */
  static getCategoryBreakdown() {
    return db.prepare(`
      SELECT
        category,
        type,
        ROUND(SUM(amount), 2) as total,
        COUNT(*) as count
      FROM financial_records
      WHERE is_deleted = 0
      GROUP BY category, type
      ORDER BY total DESC
    `).all();
  }

  /**
   * Get monthly income/expense trends.
   * @param {number} [months=12] - Number of months to return
   * @returns {Array} [{ month, income, expense, net }]
   */
  static getMonthlyTrends(months = 12) {
    return db.prepare(`
      SELECT
        strftime('%Y-%m', date) as month,
        ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 2) as income,
        ROUND(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 2) as expense,
        ROUND(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 2) as net
      FROM financial_records
      WHERE is_deleted = 0
      GROUP BY strftime('%Y-%m', date)
      ORDER BY month DESC
      LIMIT ?
    `).all(months);
  }

  /**
   * Get the most recent financial records.
   * @param {number} [limit=10] - Number of records to return
   * @returns {Array}
   */
  static getRecentActivity(limit = 10) {
    return db.prepare(`
      SELECT r.*, u.username as created_by
      FROM financial_records r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.is_deleted = 0
      ORDER BY r.created_at DESC
      LIMIT ?
    `).all(limit);
  }

  /**
   * Count total active (non-deleted) records.
   * @returns {number}
   */
  static count() {
    const { total } = db.prepare(
      'SELECT COUNT(*) as total FROM financial_records WHERE is_deleted = 0'
    ).get();
    return total;
  }
}

module.exports = Record;

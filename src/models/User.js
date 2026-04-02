const { db } = require('../config/database');

/**
 * User Model — Data Access Layer
 * Handles all database operations for the users table.
 * Uses prepared statements for security and performance.
 */
class User {
  /**
   * Create a new user.
   * @param {object} data - { username, email, password_hash, full_name, role }
   * @returns {object} The created user (without password_hash)
   */
  static create({ username, email, password_hash, full_name, role = 'viewer' }) {
    const stmt = db.prepare(`
      INSERT INTO users (username, email, password_hash, full_name, role)
      VALUES (@username, @email, @password_hash, @full_name, @role)
    `);

    const result = stmt.run({ username, email, password_hash, full_name, role });
    return User.findById(result.lastInsertRowid);
  }

  /**
   * Find a user by ID.
   * @param {number} id
   * @returns {object|undefined} User object (without password_hash)
   */
  static findById(id) {
    return db.prepare(`
      SELECT id, username, email, full_name, role, is_active, created_at, updated_at
      FROM users WHERE id = ?
    `).get(id);
  }

  /**
   * Find a user by ID, including the password hash (for authentication).
   * @param {number} id
   * @returns {object|undefined}
   */
  static findByIdWithPassword(id) {
    return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  }

  /**
   * Find a user by email.
   * @param {string} email
   * @returns {object|undefined} Full user object (includes password_hash for auth)
   */
  static findByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  }

  /**
   * Find a user by username.
   * @param {string} username
   * @returns {object|undefined} Full user object
   */
  static findByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  }

  /**
   * Get all users with pagination.
   * @param {object} options - { page, limit }
   * @returns {object} { users, total, page, limit, totalPages }
   */
  static findAll({ page = 1, limit = 20 } = {}) {
    const offset = (page - 1) * limit;

    const users = db.prepare(`
      SELECT id, username, email, full_name, role, is_active, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `).all(limit, offset);

    const { total } = db.prepare('SELECT COUNT(*) as total FROM users').get();

    return {
      users,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Update a user's role.
   * @param {number} id
   * @param {string} role - 'admin' | 'analyst' | 'viewer'
   * @returns {object|undefined} Updated user
   */
  static updateRole(id, role) {
    const stmt = db.prepare(`
      UPDATE users SET role = ?, updated_at = datetime('now') WHERE id = ?
    `);

    const result = stmt.run(role, id);

    if (result.changes === 0) return undefined;
    return User.findById(id);
  }

  /**
   * Update a user's active status.
   * @param {number} id
   * @param {boolean} isActive
   * @returns {object|undefined} Updated user
   */
  static updateStatus(id, isActive) {
    const stmt = db.prepare(`
      UPDATE users SET is_active = ?, updated_at = datetime('now') WHERE id = ?
    `);

    const result = stmt.run(isActive ? 1 : 0, id);

    if (result.changes === 0) return undefined;
    return User.findById(id);
  }

  /**
   * Delete a user permanently.
   * @param {number} id
   * @returns {boolean} True if a user was deleted
   */
  static delete(id) {
    const result = db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  /**
   * Check if email already exists.
   * @param {string} email
   * @returns {boolean}
   */
  static emailExists(email) {
    const row = db.prepare('SELECT 1 FROM users WHERE email = ?').get(email);
    return !!row;
  }

  /**
   * Check if username already exists.
   * @param {string} username
   * @returns {boolean}
   */
  static usernameExists(username) {
    const row = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username);
    return !!row;
  }

  /**
   * Count total users (for dashboard/stats).
   * @returns {number}
   */
  static count() {
    const { total } = db.prepare('SELECT COUNT(*) as total FROM users').get();
    return total;
  }
}

module.exports = User;

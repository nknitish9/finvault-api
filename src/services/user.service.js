const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { ROLES } = require('../utils/constants');

/**
 * User Service — Handles user management business logic (Admin operations).
 */
class UserService {
  /**
   * Get all users with pagination.
   * @param {object} query - { page, limit }
   * @returns {object} { users, total, page, limit, totalPages }
   */
  static getAllUsers({ page = 1, limit = 20 } = {}) {
    page = Math.max(1, parseInt(page, 10) || 1);
    limit = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));

    return User.findAll({ page, limit });
  }

  /**
   * Get a single user by ID.
   * @param {number} id
   * @returns {object} User
   */
  static getUserById(id) {
    const user = User.findById(id);

    if (!user) {
      throw ApiError.notFound(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Update a user's role.
   * @param {number} id - User ID to update
   * @param {string} role - New role
   * @param {number} requesterId - ID of the admin making the request
   * @returns {object} Updated user
   */
  static updateUserRole(id, role, requesterId) {
    // Prevent admin from changing their own role
    if (id === requesterId) {
      throw ApiError.badRequest('You cannot change your own role');
    }

    // Validate role
    const validRoles = Object.values(ROLES);
    if (!validRoles.includes(role)) {
      throw ApiError.badRequest(`Invalid role. Must be one of: ${validRoles.join(', ')}`);
    }

    const user = User.updateRole(id, role);

    if (!user) {
      throw ApiError.notFound(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Activate or deactivate a user.
   * @param {number} id - User ID
   * @param {boolean} isActive - New status
   * @param {number} requesterId - ID of the admin making the request
   * @returns {object} Updated user
   */
  static updateUserStatus(id, isActive, requesterId) {
    // Prevent admin from deactivating themselves
    if (id === requesterId) {
      throw ApiError.badRequest('You cannot change your own account status');
    }

    const user = User.updateStatus(id, isActive);

    if (!user) {
      throw ApiError.notFound(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Delete a user permanently.
   * @param {number} id - User ID to delete
   * @param {number} requesterId - ID of the admin making the request
   * @returns {boolean}
   */
  static deleteUser(id, requesterId) {
    // Prevent admin from deleting themselves
    if (id === requesterId) {
      throw ApiError.badRequest('You cannot delete your own account');
    }

    // Check if user exists
    const user = User.findById(id);
    if (!user) {
      throw ApiError.notFound(`User with ID ${id} not found`);
    }

    return User.delete(id);
  }
}

module.exports = UserService;

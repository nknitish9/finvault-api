const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const env = require('../config/environment');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * Auth Service — Handles authentication business logic.
 */
class AuthService {
  /**
   * Register a new user.
   * @param {object} data - { username, email, password, full_name, role }
   * @returns {object} { user, token }
   */
  static async register({ username, email, password, full_name, role = 'viewer' }) {
    // Check for existing email
    if (User.emailExists(email)) {
      throw ApiError.conflict('Email is already registered');
    }

    // Check for existing username
    if (User.usernameExists(username)) {
      throw ApiError.conflict('Username is already taken');
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash(password, salt);

    // Create user
    const user = User.create({
      username,
      email,
      password_hash,
      full_name,
      role,
    });

    // Generate JWT
    const token = AuthService.generateToken(user);

    return { user, token };
  }

  /**
   * Authenticate a user and return a JWT.
   * @param {string} email
   * @param {string} password
   * @returns {object} { user, token }
   */
  static async login(email, password) {
    // Find user by email (includes password hash)
    const user = User.findByEmail(email);

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check if user is active
    if (!user.is_active) {
      throw ApiError.forbidden('Account is deactivated — Contact an administrator');
    }

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Exclude password_hash from the response
    const { password_hash, ...userWithoutPassword } = user;

    // Generate JWT
    const token = AuthService.generateToken(userWithoutPassword);

    return { user: userWithoutPassword, token };
  }

  /**
   * Get user profile by ID.
   * @param {number} userId
   * @returns {object} User profile (without password)
   */
  static getProfile(userId) {
    const user = User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    return user;
  }

  /**
   * Generate a JWT token for a user.
   * @param {object} user - User object with id, role
   * @returns {string} JWT token
   */
  static generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );
  }
}

module.exports = AuthService;

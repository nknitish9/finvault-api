const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { updateRoleValidator, updateStatusValidator } = require('../validators/user.validator');
const UserService = require('../services/user.service');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// All user routes require authentication and admin role
router.use(authenticate, authorize(ROLES.ADMIN));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: List all users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: Paginated list of users
 */
router.get('/', (req, res, next) => {
  try {
    const result = UserService.getAllUsers(req.query);
    const { users, ...meta } = result;
    ApiResponse.success(res, { data: { users }, meta });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get a single user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User profile
 *       404:
 *         description: User not found
 */
router.get('/:id', (req, res, next) => {
  try {
    const user = UserService.getUserById(req.params.id);
    ApiResponse.success(res, { data: { user } });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Update a user's role (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - role
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [admin, analyst, viewer]
 *     responses:
 *       200:
 *         description: Role updated
 *       400:
 *         description: Cannot change own role
 */
router.put('/:id/role', updateRoleValidator, validate, (req, res, next) => {
  try {
    const updatedUser = UserService.updateUserRole(
      parseInt(req.params.id, 10),
      req.body.role,
      req.user.id
    );
    ApiResponse.success(res, { message: 'User role updated', data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Activate/Deactivate a user account (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - is_active
 *             properties:
 *               is_active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Status updated
 *       400:
 *         description: Cannot deactivate own account
 */
router.patch('/:id/status', updateStatusValidator, validate, (req, res, next) => {
  try {
    const updatedUser = UserService.updateUserStatus(
      parseInt(req.params.id, 10),
      req.body.is_active,
      req.user.id
    );
    ApiResponse.success(res, { message: 'User status updated', data: { user: updatedUser } });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Delete a user permanently (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User deleted
 *       400:
 *         description: Cannot delete own account
 */
router.delete('/:id', (req, res, next) => {
  try {
    UserService.deleteUser(parseInt(req.params.id, 10), req.user.id);
    ApiResponse.success(res, { message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

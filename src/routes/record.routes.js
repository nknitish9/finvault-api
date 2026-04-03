const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createRecordValidator,
  updateRecordValidator,
  getRecordsQueryValidator,
} = require('../validators/record.validator');
const RecordService = require('../services/record.service');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// All records routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/records:
 *   post:
 *     summary: Create a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - category
 *               - amount
 *               - date
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Record created
 *       403:
 *         description: Forbidden (Not an admin)
 */
router.post(
  '/',
  authorize(ROLES.ADMIN),
  createRecordValidator,
  validate,
  (req, res, next) => {
    try {
      const record = RecordService.createRecord(req.body, req.user.id);
      ApiResponse.created(res, { message: 'Record created', data: { record } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/records:
 *   get:
 *     summary: List records with filtering and pagination
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [income, expense]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Paginated records list
 */
router.get('/', getRecordsQueryValidator, validate, (req, res, next) => {
  try {
    const result = RecordService.getRecords(req.query);
    const { records, ...meta } = result;
    ApiResponse.success(res, { data: { records }, meta });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   get:
 *     summary: Get a single financial record by ID
 *     tags: [Records]
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
 *         description: Record data
 *       404:
 *         description: Record not found
 */
router.get('/:id', (req, res, next) => {
  try {
    const record = RecordService.getRecordById(parseInt(req.params.id, 10));
    ApiResponse.success(res, { data: { record } });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/records/{id}:
 *   put:
 *     summary: Update a financial record (Admin only)
 *     tags: [Records]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [income, expense]
 *               category:
 *                 type: string
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Record updated
 */
router.put(
  '/:id',
  authorize(ROLES.ADMIN),
  updateRecordValidator,
  validate,
  (req, res, next) => {
    try {
      const record = RecordService.updateRecord(parseInt(req.params.id, 10), req.body);
      ApiResponse.success(res, { message: 'Record updated', data: { record } });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/records/{id}:
 *   delete:
 *     summary: Soft delete a financial record (Admin only)
 *     tags: [Records]
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
 *         description: Record deleted
 */
router.delete('/:id', authorize(ROLES.ADMIN), (req, res, next) => {
  try {
    RecordService.deleteRecord(parseInt(req.params.id, 10));
    ApiResponse.success(res, { message: 'Record deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

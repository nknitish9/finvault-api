const express = require('express');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const DashboardService = require('../services/dashboard.service');
const ApiResponse = require('../utils/ApiResponse');
const { ROLES } = require('../utils/constants');

const router = express.Router();

// All array endpoints are accessible by Admin and Analyst
router.use(authenticate, authorize(ROLES.ADMIN, ROLES.ANALYST));

/**
 * @swagger
 * /api/dashboard/summary:
 *   get:
 *     summary: Get overall financial summary
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Summary data
 *       403:
 *         description: Forbidden (Viewer access denied)
 */
router.get('/summary', (req, res, next) => {
  try {
    const summary = DashboardService.getSummary();
    ApiResponse.success(res, { data: summary });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/dashboard/category-breakdown:
 *   get:
 *     summary: Get totals grouped by category
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category breakdown
 */
router.get('/category-breakdown', (req, res, next) => {
  try {
    const breakdown = DashboardService.getCategoryBreakdown();
    ApiResponse.success(res, { data: breakdown });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/dashboard/monthly-trends:
 *   get:
 *     summary: Get monthly income and expense trends
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Monthly trends data
 */
router.get('/monthly-trends', (req, res, next) => {
  try {
    const trends = DashboardService.getMonthlyTrends();
    ApiResponse.success(res, { data: trends });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/dashboard/recent-activity:
 *   get:
 *     summary: Get most recent financial records
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recent activity
 */
router.get('/recent-activity', (req, res, next) => {
  try {
    const activity = DashboardService.getRecentActivity();
    ApiResponse.success(res, { data: activity });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

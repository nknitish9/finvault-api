const Record = require('../models/Record');
const User = require('../models/User');

/**
 * Dashboard Service — Handles analytics and summary business logic.
 */
class DashboardService {
  /**
   * Get overall financial summary.
   * Returns total income, total expenses, net balance, and record count.
   * @returns {object}
   */
  static getSummary() {
    const summary = Record.getSummary();
    const userCount = User.count();

    return {
      ...summary,
      user_count: userCount,
    };
  }

  /**
   * Get category-wise breakdown of financials.
   * Groups totals by category and type (income/expense).
   * @returns {object} { income_categories, expense_categories }
   */
  static getCategoryBreakdown() {
    const breakdown = Record.getCategoryBreakdown();

    // Separate into income and expense groupings for cleaner response
    const income_categories = breakdown
      .filter((item) => item.type === 'income')
      .map(({ category, total, count }) => ({ category, total, count }));

    const expense_categories = breakdown
      .filter((item) => item.type === 'expense')
      .map(({ category, total, count }) => ({ category, total, count }));

    return {
      income_categories,
      expense_categories,
      total_categories: new Set(breakdown.map((item) => item.category)).size,
    };
  }

  /**
   * Get monthly income/expense trends.
   * @param {number} [months=12] - Number of months to return
   * @returns {object} { trends, period }
   */
  static getMonthlyTrends(months = 12) {
    const trends = Record.getMonthlyTrends(months);

    return {
      trends,
      period: `Last ${months} months`,
      total_months: trends.length,
    };
  }

  /**
   * Get recent financial activity.
   * @param {number} [limit=10]
   * @returns {object} { records, count }
   */
  static getRecentActivity(limit = 10) {
    const records = Record.getRecentActivity(limit);

    return {
      records,
      count: records.length,
    };
  }
}

module.exports = DashboardService;

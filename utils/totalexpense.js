// utils/calculateTotalIncome.js
const Expense = require("../database/expenses");

/**
 * Calculate total income, optionally filtered by year/month/day/category.
 *
 * @param {Object} filters
 * @param {string} [filters.year]     Four‑digit year, e.g. "2025"
 * @param {string} [filters.month]    Two‑digit month, e.g. "06"
 * @param {string} [filters.day]      Two‑digit day, e.g. "15"
 * @param {string} [filters.category] Partial or full category name, case‑insensitive
 * @returns {Promise<number>} total
 */
async function calculateTotalExpense(filters = {}) {
  const { year, month, day, category } = filters;

  // Build your Mongo query
  const query = {};

  // Category filter
  if (category) {
    query.category = { $regex: category, $options: "i" };
  }

  // Date filters—since you store date as "YYYY-MM-DD" (string), we can match via regex:
  if (year) {
    // anchor at start: "2025-"
    query.date = { $regex: `^${year}-` };
  }
  if (month) {
    const mm = month.padStart(2, "0");
    // either extend existing regex or set new
    query.date = {
      ...query.date,
      $regex: `^${year || "\\d{4}"}-${mm}-`,
    };
  }
  if (day) {
    const dd = day.padStart(2, "0");
    query.date = {
      ...query.date,
      $regex: `^${year || "\\d{4}"}-${month ? month.padStart(2, "0") : "\\d{2}"}-${dd}$`,
    };
  }

  // Fetch just the matching docs
  const expenses = await Expense.find(query);

  // Sum them
  return expenses.reduce(
    (sum, inc) => sum + (inc.amount || 0) * (inc.count || 1),
    0
  );
}

module.exports = calculateTotalExpense;

const Expense = require("../database/expenses");


async function calculateMonthlyTotalExpense(month, year) {
  // Parse and validate inputs
  const parsedMonth = Number(month);
  const parsedYear  = Number(year);
  if (
    Number.isNaN(parsedMonth) ||
    parsedMonth < 1 ||
    parsedMonth > 12 ||
    Number.isNaN(parsedYear)
  ) {
    throw new Error("Invalid month or year");
  }

  // Fetch all income records
  const expenses = await Expense.find();

  // Sum only those matching the requested month/year
  let totalMonthlyExpense = 0;
  expenses.forEach((inc) => {
    const expenseDate = new Date(inc.date);
    if (
      expenseDate.getMonth() + 1 === parsedMonth &&  // JS months are 0–11
      expenseDate.getFullYear()    === parsedYear
    ) {
      totalMonthlyExpense += (inc.amount || 0) * (inc.count || 1);
    }
  });

  return totalMonthlyExpense;
}

module.exports = calculateMonthlyTotalExpense;
// utils/calculateTotalIncome.js
const Income = require("../database/income");

async function calculateTotalIncome() {
  // Fetch all income documents
  const incomes = await Income.find();

  // Sum them in a local variable
  let total = 0;
  for (const inc of incomes) {
    total += (inc.amount || 0) * (inc.count || 1);
  }

  return total;
}

module.exports = calculateTotalIncome;

const Income = require("../database/income");


async function calculateMonthlyTotalIncome(month, year) {
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
  const incomes = await Income.find();

  // Sum only those matching the requested month/year
  let totalMonthlyIncome = 0;
  incomes.forEach((inc) => {
    const incomeDate = new Date(inc.date);
    if (
      incomeDate.getMonth() + 1 === parsedMonth &&  // JS months are 0–11
      incomeDate.getFullYear()    === parsedYear
    ) {
      totalMonthlyIncome += (inc.amount || 0) * (inc.count || 1);
    }
  });

  return totalMonthlyIncome;
}

module.exports = calculateMonthlyTotalIncome;
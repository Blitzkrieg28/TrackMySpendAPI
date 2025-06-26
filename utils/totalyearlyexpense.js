 const Expense = require("../database/expenses");


async function calculateYearlyTotalExpense( year) {
  // Parse and validate inputs
    const parsedyear= parseInt(year);


  // Fetch all income records
    const expenses= await Expense.find();// fetching all data from database

  // Sum only those matching the requested month/year
  let totalyearlyExpense = 0;
  
    expenses.forEach(function(expense){
        const expenseDate = new Date(expense.date);

        if (
          expenseDate.getFullYear() === parsedyear // Match year
        ) {
        expenseYear=expenseDate.getFullYear();
          totalyearlyExpense += (expense.amount*expense.count);
        }
    })
  return totalyearlyExpense;
}

module.exports = calculateYearlyTotalExpense;
 
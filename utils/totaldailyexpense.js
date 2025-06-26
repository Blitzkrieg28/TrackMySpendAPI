const Expense = require("../database/expenses");


async function calculateDailyTotalExpense(day,month, year) {
  // Parse and validate inputs
   const parsedday= parseInt(day);
    const parsedmonth= parseInt(month);
    const parsedyear= parseInt(year);

    const expenses= await Expense.find();// fetching all data from database
   let totaldailyExpense= 0;
    expenses.forEach(function(income){
        const incomeDate = new Date(income.date);

        if (
          incomeDate.getDate() === parsedday &&  
          incomeDate.getMonth() + 1 === parsedmonth && // Match month (0-based index)
          incomeDate.getFullYear() === parsedyear // Match year
        ) {
        incomeDay= incomeDate.getDate();    
        incomeMonth=incomeDate.getMonth() + 1;
        incomeYear=incomeDate.getFullYear();
          totaldailyExpense += (income.amount*income.count);
        }
    })
  return totaldailyExpense;
}

module.exports = calculateDailyTotalExpense;
    
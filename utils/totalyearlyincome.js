 const Income = require("../database/income");


async function calculateYearlyTotalIncome( year) {
  // Parse and validate inputs
    const parsedyear= parseInt(year);


  // Fetch all income records
    const incomes= await Income.find();// fetching all data from database

  // Sum only those matching the requested month/year
  let totalyearlyIncome = 0;
  
    incomes.forEach(function(income){
        const incomeDate = new Date(income.date);

        if (
          incomeDate.getFullYear() === parsedyear // Match year
        ) {
        incomeYear=incomeDate.getFullYear();
          totalyearlyIncome += (income.amount*income.count);
        }
    })
  return totalyearlyIncome;
}

module.exports = calculateYearlyTotalIncome;
 
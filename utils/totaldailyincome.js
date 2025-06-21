const Income = require("../database/income");


async function calculateDailyTotalIncome(day,month, year) {
  // Parse and validate inputs
   const parsedday= parseInt(day);
    const parsedmonth= parseInt(month);
    const parsedyear= parseInt(year);

    const incomes= await Income.find();// fetching all data from database
   let totaldailyIncome= 0;
    incomes.forEach(function(income){
        const incomeDate = new Date(income.date);

        if (
          incomeDate.getDate() === parsedday &&  
          incomeDate.getMonth() + 1 === parsedmonth && // Match month (0-based index)
          incomeDate.getFullYear() === parsedyear // Match year
        ) {
        incomeDay= incomeDate.getDate();    
        incomeMonth=incomeDate.getMonth() + 1;
        incomeYear=incomeDate.getFullYear();
          totaldailyIncome += (income.amount*income.count);
        }
    })
  return totaldailyIncome;
}

module.exports = calculateDailyTotalIncome;
    
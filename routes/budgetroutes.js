const express= require('express');
const router= express.Router();
const jwt= require('jsonwebtoken');
const JWT_SECRET= 'secret';
const authmiddleware= require('../middlewares/zodauth');
const tokenVerificationMiddleware= require('../middlewares/tokenauth');
const USERS= require('../database/users');
const EXPENSES= require('../database/expenses');
const INCOMES= require('../database/income');
const validationMiddleware= require('../middlewares/validauth');
global.totalexpensecategory= 0;
global.totalincomecategory= 0;
global.totalExpense;
global.totalIncome;
global.totalmonthlyIncome =0;
global.totalmonthlyExpense= 0;
global.incomeMonth= 0;
global.expenseMonth =0;
global.expenseYear= 0;
global.totalyearlyExpense= 0;
global.totaldailyExpense= 0;
global.expenseDay =0;
global.incomeYear= 0;
global.totalyearlyIncome= 0;
global.totaldailyIncome= 0;
global.incomeDay =0;
global.expenseCategory= "";
global.incomeCategory= "";


//router.use(tokenVerificationMiddleware);

function budgetcalculator(income,expense){
    let budget= income*(0.3);

    if(budget<=expense){
        let extra= Math.abs(budget-expense);
       return({
            message: "you have spend "+extra+" more then expected",
        })
    }
    else{
        let extra= Math.abs(budget-expense);
        return({
            message: "you have spend "+extra+" less then expected on this category",
        })
    }

}


        // router.get("/categorywisebudget" ,function(req,res){
        //     const category= req.query.category;
        //     if(incomeCategory===expenseCategory && incomeCategory=== category){
        //     const message= budgetcalculator(totalincomecategory,totalexpensecategory);
        //     res.send({
        //     message,
        //     })
        // }
        // else{
        //     res.send({
        //         message: "income-category and expense-category does not match!! "
        //     })
        // }
        
        // })

router.get("/totalbudget",function(req,res){
   const message= budgetcalculator(totalIncome,totalExpense);
   res.send({
    message,
   })
   console.log(totalExpense);
   console.log(totalIncome);

})

router.get("/monthlybudget" ,function(req,res){
    const month= req.query.month;
    const year= req.query.year;
    console.log(totalmonthlyExpense);

if( incomeMonth==expenseMonth && incomeYear==expenseYear && incomeMonth==month && incomeYear== year){
    const message= budgetcalculator(totalmonthlyIncome,totalmonthlyExpense);
    res.send({
     message,
    })
 
}
else{
    res.send({
        message: "income-month/year and expense-month/year does not match!! "
    })
}

})

router.get("/yearlybudget" ,function(req,res){
    const year= req.query.year;
    if(incomeYear==expenseYear && incomeYear==year){
        const message= budgetcalculator(totalyearlyIncome,totalyearlyExpense);
        res.send({
         message,
        })
     
    }
    else{
        res.send({
            message: "income-year and expense-year does not match!! "
        })
    }
    
})

router.get("/dailybudget" ,function(req,res){
    const month= req.query.month;
    const year= req.query.year;
    const day= req.query.day;
    if(incomeDay==expenseDay&&incomeMonth==expenseMonth&&incomeYear==expenseYear&&incomeDay==day&&incomeMonth==month&&incomeYear==year){
        const message= budgetcalculator(totaldailyIncome,totaldailyExpense);
   res.send({
    message,
   })

    }
    else{
        res.send({
            message: "income-day and expense-day does not match!! "
        })
    }
})

module.exports= router;


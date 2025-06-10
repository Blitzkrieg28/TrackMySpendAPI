const express= require('express');
const router= express.Router();
const jwt= require('jsonwebtoken');
const JWT_SECRET= 'secret';
const authmiddleware= require('../middlewares/zodauth');
const tokenVerificationMiddleware= require('../middlewares/tokenauth');
const User= require('../database/users');
const Expense= require('../database/expenses');
const Income= require('../database/income');
const validationMiddleware= require('../middlewares/validauth');
global.totalexpensecategory= 0;
global.totalincomecategory= 0;
global.expenseCategory= "";
global.incomeCategory= "";

//router.use(tokenVerificationMiddleware);

router.get("/viewexpensecategory" , async function(req,res){
  

  const categories=[];

  const expenses =await Expense.find();

  expenses.forEach(function(expense){
    if(expense.category=== req.query.category){
        categories.push(
            expense
        )
    }
  })
    res.send({
        categories,
    })
    console.log(categories);
})

router.get("/viewincomecategory" ,async function(req,res){
  

    const categories=[];

    const incomes =await Income.find();
  
    incomes.forEach(function(income){
      if(income.category=== req.query.category){
          categories.push(
              income
          )
      }
    })
    res.send({
        categories,
    })
    console.log(categories);
})

router.get("/totalexpensecategory" ,async function(req,res){
    const expenses =await Expense.find();

    expenses.forEach(function(expense){
      if(expense.category=== req.query.category){
         totalexpensecategory+=((expense.amount)*(expense.count));
      }
    })
    
    res.send({
        totalexpensecategory,
    })

    console.log(totalexpensecategory);
})

router.get("/totalincomecategory" ,async function(req,res){
    const incomes =await Income.find();
  
    incomes.forEach(function(income){
      if(income.category=== req.query.category){
          totalincomecategory+=((income.amount)*(income.count));
      }
    })

    res.send({
        totalincomecategory,
    })

    console.log(totalincomecategory);
})








module.exports= router;
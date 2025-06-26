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
/**
 * @swagger
 * /viewexpensecategory:
 *   get:
 *     summary: View all expenses in a specific category
 *     description: Returns a list of expenses matching the given category.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense category to filter
 *     responses:
 *       200:
 *         description: List of matching expenses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 */

/**
 * @swagger
 * /viewincomecategory:
 *   get:
 *     summary: View all incomes in a specific category
 *     description: Returns a list of incomes matching the given category.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Income category to filter
 *     responses:
 *       200:
 *         description: List of matching incomes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Income'
 */

/**
 * @swagger
 * /totalexpensecategory:
 *   get:
 *     summary: Get total expense for a specific category
 *     description: Calculates and returns the total amount spent for the specified expense category.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Expense category
 *     responses:
 *       200:
 *         description: Total expense amount for the category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalexpensecategory:
 *                   type: number
 */

/**
 * @swagger
 * /totalincomecategory:
 *   get:
 *     summary: Get total income for a specific category
 *     description: Calculates and returns the total income for the specified income category.
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         required: true
 *         description: Income category
 *     responses:
 *       200:
 *         description: Total income amount for the category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalincomecategory:
 *                   type: number
 */
router.get("/filter", async (req, res) => {
  const { month, year, day } = req.query;

  const incomes = await Income.find();
  const filtered = incomes.filter((inc) => {
    const [incYear, incMonth, incDay] = inc.date.split("-"); // assumes YYYY-MM-DD

    return (
      (!month || incMonth === month) &&
      (!year || incYear === year) &&
      (!day || incDay === day)
    );
  });

  res.send({ filtered });
});

router.get("/expensefilter", async (req, res) => {
  const { month, year, day } = req.query;

  const expenses = await Expense.find();
  const filtered = expenses.filter((inc) => {
    const [incYear, incMonth, incDay] = inc.date.split("-"); // assumes YYYY-MM-DD

    return (
      (!month || incMonth === month) &&
      (!year || incYear === year) &&
      (!day || incDay === day)
    );
  });

  res.send({ filtered });
});

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
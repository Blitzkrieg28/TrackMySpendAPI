const express= require('express');
const router= express.Router();
const jwt= require('jsonwebtoken');
const dotenv= require('dotenv');
dotenv.config();
const JWT_SECRET= process.env.JWT_SECRET || 'secret';
const authmiddleware= require('../middlewares/zodauth');
const tokenVerificationMiddleware= require('../middlewares/tokenauth');
const User= require('../database/users');
const Expense= require('../database/expenses');
const validationMiddleware= require('../middlewares/validauth');
const calculateTotalExpense = require('../utils/totalexpense');
const calculateMonthlyTotalExpense = require('../utils/totalmonthlyexpense');
const calculateYearlyTotalExpense = require('../utils/totalyearlyexpense');
const calculateDailyTotalExpense = require('../utils/totaldailyexpense');
global.totalExpense= 0;
global.totalmonthlyExpense= 0;
global.expenseMonth= 0;
global.expenseYear= 0;
global.totalyearlyExpense= 0;
global.totaldailyExpense= 0;
global.expenseDay =0;

// Apply authentication middleware to all routes
//router.use(tokenVerificationMiddleware);

router.get("/viewexpense" ,async function(req,res){
    const expenselist= await Expense.find();
    res.send({
        message: "here view your expense list",
        expenselist,
        middlewareMessage: req.authMessage,
    })
    console.log(expenselist);
})

/**
 * @swagger
 * /expense/addexpense:
 *   post:
 *     summary: Add an expense
 *     tags: [Expense]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               category:
 *                 type: string
 *               date:
 *                 type: string
 *               count:
 *                 type: number
 *     responses:
 *       200:
 *         description: Expense added or updated
 */

router.post("/addexpense" ,validationMiddleware,async function(req,res){
    let {amount,category,date,count,to,time} =req.body;
    const existingExpense= await Expense.findOne({
        amount:amount,
        category:category,
        date:date,
        time:time,
        to:to
    });
    if(existingExpense){
        await Expense.updateOne(
            {
              amount: amount,
              category: category,
              date: date,
              time: time,
              to: to
            },
            {
              $inc: { count: count }, // Increment the count by the provided value
            }
          );
       return res.send({
      message: "Income updated successfully!",
      middlewareMessage: req.authMessage,
      expense: existingExpense  // you can optionally send existingIncome here if you want
    });

      }

      const newexpense= await Expense.create({
        amount:amount,
        category:category,
        date:date,
        count: count,
        to: to,
        time: time
    })
    
      
    res.send({
        message: "expense added successfully!!!",
        middlewareMessage: req.authMessage,
        expense: newexpense

    })
    
})

 router.put("/updatexpense",validationMiddleware,async function(req,res){
    const {id,amount,category,date,count,time,to} =req.body;
    const updateFields = {};
  if (amount !== undefined) updateFields.amount = amount;
  if (category !== undefined) updateFields.category = category;
  if (date !== undefined) updateFields.date = date;
  if (count !== undefined) updateFields.count = count;
  if (to !== undefined) updateFields.to = to;
  if (time !== undefined) updateFields.time = time;

    const existingId=await Expense.findById(id);
    if(!existingId){
        return res.status(404).send({
            msg: "user not found!!",
        })
    }
    
        await Expense.updateOne(  { _id: id }, // Match by ObjectId
            { $set: updateFields } // Update only the provided fields)
        )
    
    const updatedexpense= await Expense.findById(id);
     res.send({
        middlewareMessage: req.authMessage,
        message: "expense updated successfully!!",
        updatedexpense
       
     })
    console.log(updatedexpense);
 })

 router.delete("/deletexpense",validationMiddleware,async function(req,res){
    const {id} =req.body;
    const existingId=await Expense.findById(id);
    if(!existingId){
        return res.status(404).send({
            msg: "user not found!!",
        })
    }
    
    await Expense.deleteOne({
        _id:id
    });



    
        res.send({
            middlewareMessage: req.authMessage,
            message: "expense deleted successfully!!",
       
        })

        console.log("deletion successfull!!");
        
    
 })

  router.get("/totalexpense" , async function(req,res){
   try {
    // Pass along any of year, month, day, category that the client provided
    const filters = {
      year:     req.query.year,
      month:    req.query.month,
      day:      req.query.day,
      category: req.query.category,
    };

    const totalExpense = await calculateTotalExpense(filters);

    console.log("Computed totalIncome with filters", filters, "→", totalExpense);
    return res.json({ totalExpense });
  } catch (err) {
    console.error("Error computing total income:", err);
    return res.status(500).json({ message: "Server error" });
  }

  })

  router.get("/monthlytotalexpense" ,async function(req,res){
   try {
    // 1️⃣ Compute “today” in IST
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istDate   = new Date(utcMillis + istOffset);

    // 2️⃣ Use query params if available; else use IST date
    const month = parseInt(req.query.month, 10) || (istDate.getMonth() + 1); // 1–12
    const year  = parseInt(req.query.year,  10) || istDate.getFullYear();

    // 3️⃣ Call util to calculate total
    const total = await calculateMonthlyTotalExpense(month, year);

    // 4️⃣ Return response
    return res.json({ totalmonthlyExpense: total });
  } 
  catch (err) {
    console.error("Error computing monthly total income:", err);
    return res.status(500).json({ message: "Server error" });
  }
  })

  router.get("/yearlytotalexpense" ,async function(req,res){
     try {
    // 1️⃣ Compute “today” in IST
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istDate   = new Date(utcMillis + istOffset);

    // 2️⃣ Use query param if available; else fallback to IST year
    const year = parseInt(req.query.year, 10) || istDate.getFullYear();

    // 3️⃣ Call util to compute total
    const total = await calculateYearlyTotalExpense(year);

    // 4️⃣ Return result
    return res.json({ totalYearlyExpense: total });
  } 
  catch (err) {
    console.error("Error computing yearly total income:", err);
    return res.status(500).json({ message: "Server error" });
  }
  })

  router.get("/dailytotalexpense" ,async function(req,res){
   try {
    // 1️⃣ Compute IST “now”
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istDate   = new Date(utcMillis + istOffset);

    // 2️⃣ Use query params or fallback to IST date
    const year  = parseInt(req.query.year,  10) || istDate.getFullYear();
    const month = parseInt(req.query.month, 10) || (istDate.getMonth() + 1);
    const day   = parseInt(req.query.day,   10) || istDate.getDate();

    // 3️⃣ Call your existing helper
    const total = await calculateDailyTotalExpense(day, month, year);

    // 4️⃣ Respond
    return res.json({
     // date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      totalDailyExpense: total
    });
  } 
  catch (err) {
    console.error("Error computing today's total income:", err);
    return res.status(500).json({ message: "Server error" });
  }
  })
   
  router.get('/eachmonthexpense', async (req, res) => {
  try {
    // 🕒 Get IST date
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istDate   = new Date(utcMillis + istOffset);

    // 📅 Determine target year
    const year = parseInt(req.query.year, 10) || istDate.getFullYear();

    // 📦 Fetch all income records
    const expenses = await Expense.find();

    // 📊 Initialize monthly totals (Jan–Dec)
    const monthlyTotals = Array(12).fill(0);

    // 🧮 Sum incomes by month (accounting for count)
    for (const expense of expenses) {
      const dateObj = new Date(expense.date);
      if (dateObj.getFullYear() === year) {
        const monthIndex = dateObj.getMonth(); // 0-based index
        const expenseTotal = (expense.amount || 0) * (expense.count || 1);
        monthlyTotals[monthIndex] += expenseTotal;
      }
    }

    // 🏷 Month labels
    const months = [
      'Jan','Feb','Mar','Apr','May','Jun',
      'Jul','Aug','Sep','Oct','Nov','Dec'
    ];

    return res.json({ months, totals: monthlyTotals });
  }
  catch (err) {
    console.error('Error in eachmonthincome:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});
router.get('/eachweekexpense', async (req, res) => {
  try {
    // 1️⃣ Get current IST date
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istDate   = new Date(utcMillis + istOffset);

    // 2️⃣ Parse year/month from query or default to IST values
    const year  = parseInt(req.query.year, 10) || istDate.getFullYear();
    const month = parseInt(req.query.month, 10) || (istDate.getMonth() + 1);

    // 3️⃣ Fetch all incomes
    const expenses = await Expense.find();

    // 4️⃣ Initialize weekly totals [W1–W5]
    const weeklyTotals = [0, 0, 0, 0, 0];

    // 5️⃣ Calculate totals by week
    for (const income of expenses) {
      const dateObj = new Date(income.date);
      const incomeYear  = dateObj.getFullYear();
      const incomeMonth = dateObj.getMonth() + 1;

      if (incomeYear === year && incomeMonth === month) {
        const dayOfMonth = dateObj.getDate();
        const weekInMonth = Math.ceil(dayOfMonth / 7); // Week 1 to 5
        const amount = (income.amount || 0) * (income.count || 1);

        if (weekInMonth >= 1 && weekInMonth <= 5) {
          weeklyTotals[weekInMonth - 1] += amount;
        }
      }
    }

    // 6️⃣ Week labels
    const weeks = ['W1', 'W2', 'W3', 'W4', 'W5'];

    return res.json({ weeks, totals: weeklyTotals });
  }
  catch (err) {
    console.error('Error in eachweekincome:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/eachdayexpense', async (req, res) => {
  try {
    // 🕒 Compute IST date
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istDate   = new Date(utcMillis + istOffset);

    const year  = parseInt(req.query.year,  10) || istDate.getFullYear();
    const month = parseInt(req.query.month, 10) || (istDate.getMonth() + 1);
    const week  = parseInt(req.query.week,  10)
               || Math.ceil(istDate.getDate() / 7);

    // Step 1️⃣: Get all incomes for that year/month
    const incomes = await Expense.find({});

    // Step 2️⃣: Filter and compute income totals per day in the week
    const weeklyTotals = Array(7).fill(0); // Mon–Sun

    for (const income of incomes) {
      const dateObj = new Date(income.date);
      if (
        dateObj.getFullYear() === year &&
        (dateObj.getMonth() + 1) === month &&
        Math.ceil(dateObj.getDate() / 7) === week
      ) {
        const isoWeekday = dateObj.getDay(); // 0 (Sun) to 6 (Sat)

        // Convert to 1 (Mon) to 7 (Sun) format
        const adjustedDay = isoWeekday === 0 ? 7 : isoWeekday;

        // Call your utility to compute `amount × count`
        const incomeTotal = (income.amount || 0) * (income.count || 1);
        weeklyTotals[adjustedDay - 1] += incomeTotal;
      }
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return res.json({ days, totals: weeklyTotals });
  }
  catch (err) {
    console.error('Error in /eachdayincome:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


module.exports= router;
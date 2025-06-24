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
const calculateTotalIncome = require('../utils/totalincome');
const calculateMonthlyTotalIncome = require('../utils/totalmonthlyincome');
const calculateYearlyTotalIncome = require('../utils/totalyearlyincome');
const calculateDailyTotalIncome = require('../utils/totaldailyincome');
global.totalIncome= 0;
global.totalmonthlyIncome =0;
global.incomeMonth= 0;
global.incomeYear= 0;
global.totalyearlyIncome= 0;
global.totaldailyIncome= 0;
global.incomeDay =0;
//router.use(tokenVerificationMiddleware);

router.get("/viewincome" ,async function(req,res){
    const incomelist= await Income.find();
    res.send({
        message: "here view your income list",
        incomelist,
        middlewareMessage: req.authMessage,
    })
    console.log(incomelist);
})

/**
 * @swagger
 * /income/addincome:
 *   post:
 *     summary: Add income record
 *     tags: [Income]
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
 *         description: Income added or updated
 */
router.post("/addincome", validationMiddleware, async function (req, res) {
  let { amount, category, date, count, time, from } = req.body;

  const existingIncome = await Income.findOne({
    amount: amount,
    category: category,
    date: date,
    time: time,
    from: from
  });

  if (existingIncome) {
    await Income.updateOne(
      {
        amount: amount,
        category: category,
        date: date,
        time: time,
        from: from
      },
      {
        $inc: { count: count }, // Increment the count by the provided value
      }
    );

    return res.send({
      message: "Income updated successfully!",
      middlewareMessage: req.authMessage,
      income: existingIncome  // you can optionally send existingIncome here if you want
    });
  }

  // Create new income and save it to a variable
  const newIncome = await Income.create({
    amount: amount,
    category: category,
    date: date,
    count: count,
    time: time,
    from: from
  });

  // Send back the new income document including _id
  res.send({
    message: "Income added successfully!!!",
    middlewareMessage: req.authMessage,
    income: newIncome  // this contains _id and other fields
  });
});

 router.put("/updateincome",validationMiddleware,async function(req,res){
    const {id,amount,category,date,count,time,from} =req.body;
    const updateFields = {};
  if (amount !== undefined) updateFields.amount = amount;
  if (category !== undefined) updateFields.category = category;
  if (date !== undefined) updateFields.date = date;
  if (count !== undefined) updateFields.count = count;
  if (time !== undefined) updateFields.time = time;
  if (from !== undefined) updateFields.from = from;


    const existingId=await Income.findById(id);
    if(!existingId){
        return res.status(404).send({
            msg: "user not found!!",
        })
    }
    
        await Income.updateOne(  { _id: id }, // Match by ObjectId
            { $set: updateFields } // Update only the provided fields)
        )
    
    const updatedincome= await Income.findById(id);
     res.send({
        middlewareMessage: req.authMessage,
        message: "expense updated successfully!!",
        updatedincome,       
     })
    console.log(updatedincome);
 })

 router.delete("/deleteincome",validationMiddleware,async function(req,res){
    const {id,amount,category,date} =req.body;
    const existingId=await Income.findById(id);
    if(!existingId){
        return res.status(404).send({
            msg: "user not found!!",
        })
    }
    
    await Income.deleteOne({
        _id:id
    });



    
        res.send({
            middlewareMessage: req.authMessage,
            message: "income deleted successfully!!",
       
        })

        console.log("deletion successfull!!");
        
    
 })

  router.get("/totalincome" , async function(req,res){
    try {
    // Pass along any of year, month, day, category that the client provided
    const filters = {
      year:     req.query.year,
      month:    req.query.month,
      day:      req.query.day,
      category: req.query.category,
    };

    const totalIncome = await calculateTotalIncome(filters);

    console.log("Computed totalIncome with filters", filters, "→", totalIncome);
    return res.json({ totalIncome });
  } catch (err) {
    console.error("Error computing total income:", err);
    return res.status(500).json({ message: "Server error" });
  }
    //method:2-->
    // const result= await Income.aggregate([     //aggregate is a pipleine that helps to perform operation in the database itself
    //     {
    //         $group:{   //a pipeline stage which groups the document in the collection Expense based on _id
    //             _id: null, //all documenta are grouped in 1 group no subdivisions into subgroups
    //             totalIncome:{$sum:{$multiply:["$count","$amount"] }},  //operations 
    //         },
    //     },
    // ]);
    // const totalIncome= result[0].totalIncome; //aggregate always return ans in an array
    // res.send({
    //     totalIncome
    // })
    console.log(totalIncome);
   

  })
router.get("/monthlytotalincome", async (req, res) => {
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
    const total = await calculateMonthlyTotalIncome(month, year);

    // 4️⃣ Return response
    return res.json({ totalMonthlyIncome: total });
  } 
  catch (err) {
    console.error("Error computing monthly total income:", err);
    return res.status(500).json({ message: "Server error" });
  }
});


    
  router.get('/eachmonthincome', async (req, res) => {
  try {
    // 🕒 Get IST date
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istDate   = new Date(utcMillis + istOffset);

    // 📅 Determine target year
    const year = parseInt(req.query.year, 10) || istDate.getFullYear();

    // 📦 Fetch all income records
    const incomes = await Income.find();

    // 📊 Initialize monthly totals (Jan–Dec)
    const monthlyTotals = Array(12).fill(0);

    // 🧮 Sum incomes by month (accounting for count)
    for (const income of incomes) {
      const dateObj = new Date(income.date);
      if (dateObj.getFullYear() === year) {
        const monthIndex = dateObj.getMonth(); // 0-based index
        const incomeTotal = (income.amount || 0) * (income.count || 1);
        monthlyTotals[monthIndex] += incomeTotal;
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
router.get('/eachweekincome', async (req, res) => {
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
    const incomes = await Income.find();

    // 4️⃣ Initialize weekly totals [W1–W5]
    const weeklyTotals = [0, 0, 0, 0, 0];

    // 5️⃣ Calculate totals by week
    for (const income of incomes) {
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

router.get('/eachdayincome', async (req, res) => {
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
    const incomes = await Income.find({});

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

router.get("/yearlytotalincome", async (req, res) => {
  try {
    // 1️⃣ Compute “today” in IST
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;
    const istDate   = new Date(utcMillis + istOffset);

    // 2️⃣ Use query param if available; else fallback to IST year
    const year = parseInt(req.query.year, 10) || istDate.getFullYear();

    // 3️⃣ Call util to compute total
    const total = await calculateYearlyTotalIncome(year);

    // 4️⃣ Return result
    return res.json({ totalYearlyIncome: total });
  } 
  catch (err) {
    console.error("Error computing yearly total income:", err);
    return res.status(500).json({ message: "Server error" });
  }
});

  // routes/income.js
// routes/income.js
// routes/income.js

// routes/income.js

router.get("/dailytotalincome", async (req, res) => {
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
    const total = await calculateDailyTotalIncome(day, month, year);

    // 4️⃣ Respond
    return res.json({
     // date: `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      totalDailyIncome: total
    });
  } 
  catch (err) {
    console.error("Error computing today's total income:", err);
    return res.status(500).json({ message: "Server error" });
  }
});



module.exports= router;
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

router.post("/addincome" ,validationMiddleware,async function(req,res){
    let {amount,category,date,count,time,from} =req.body;
    const existingIncome= await Income.findOne({
        amount:amount,
        category:category,
        date:date,
         time:time,
         from:from
    });
    if(existingIncome){
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
          });
       

      }

      await Income.create({
        amount:amount,
        category:category,
        date:date,
        count: count,
        time: time,
        from: from
    })
    
      
    res.send({
        message: "income added successfully!!!",
        middlewareMessage: req.authMessage,

    })
    
})

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

  router.get("/monthlytotalincome" ,async function(req,res){
   try {
    const { month, year } = req.query;
    const total = await calculateMonthlyTotalIncome(month, year);
    res.json({totalMonthlyIncome: total });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
    

    
  })
  router.get('/eachmonthincome', async (req, res) => {
  try {
    // 1️⃣ Compute “today” in IST
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;    // 5.5 hours in ms
    const istDate   = new Date(utcMillis + istOffset);

    // 2️⃣ Parse year, default to IST’s current year
    const year = parseInt(req.query.year, 10) || istDate.getFullYear();

    // 3️⃣ Aggregate per month for that year
    const agg = await Income.aggregate([
      // ensure date field is a BSON Date
      { $addFields: { dateObj: { $toDate: '$date' } } },
      // match this year
      {
        $match: {
          $expr: { $eq: [ { $year: '$dateObj' }, year ] }
        }
      },
      // group by month
      {
        $group: {
          _id: { month: { $month: '$dateObj' } },
          total: { $sum: '$amount' }
        }
      },
      // sort ascending by month
      { $sort: { '_id.month': 1 } }
    ]);

    // 4️⃣ Zero-fill 12 months
    const monthlyTotals = Array(12).fill(0);
    agg.forEach(({ _id: { month }, total }) => {
      monthlyTotals[month - 1] = total;
    });

    // 5️⃣ Labels
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
    // 1️⃣ Compute “today” in IST
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;    // 5.5 hours in ms
    const istDate   = new Date(utcMillis + istOffset);

    // 2️⃣ Parse inputs, defaulting to IST year/month
    const year  = parseInt(req.query.year,  10) || istDate.getFullYear();
    const month = parseInt(req.query.month, 10) || (istDate.getMonth() + 1);

    // 3️⃣ Aggregate incomes by week-of-month
    const agg = await Income.aggregate([
      // ensure date is coerced to BSON Date
      { $addFields: { dateObj: { $toDate: '$date' } } },
      // match this year & month
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $year: '$dateObj' }, year] },
              { $eq: [{ $month: '$dateObj' }, month] }
            ]
          }
        }
      },
      // compute weekInMonth = ceil(dayOfMonth / 7)
      {
        $addFields: {
          weekInMonth: {
            $ceil: {
              $divide: [{ $dayOfMonth: '$dateObj' }, 7]
            }
          }
        }
      },
      // group by that week number
      {
        $group: {
          _id: '$weekInMonth',
          total: { $sum: '$amount' }
        }
      },
      // sort ascending by week
      { $sort: { '_id': 1 } }
    ]);

    // 4️⃣ Zero-fill weeks 1–5
    const weeklyTotals = [0, 0, 0, 0, 0];
    agg.forEach(({ _id: week, total }) => {
      if (week >= 1 && week <= 5) {
        weeklyTotals[week - 1] = total;
      }
    });

    // 5️⃣ Labels
    const weeks = ['W1','W2','W3','W4','W5'];

    return res.json({ weeks, totals: weeklyTotals });
  }
  catch (err) {
    console.error('Error in eachweekincome:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});

router.get('/eachdayincome', async (req, res) => {
  try {
    // 1️⃣ Compute “today” in IST
    const now       = new Date();
    const utcMillis = now.getTime() + now.getTimezoneOffset() * 60000;
    const istOffset = 5.5 * 60 * 60000;  // 5.5 hours in ms
    const istDate   = new Date(utcMillis + istOffset);

    // 2️⃣ Derive year/month/day from IST
    const year  = parseInt(req.query.year,  10) || istDate.getFullYear();
    const month = parseInt(req.query.month, 10) || (istDate.getMonth() + 1);
    // If client gave week, use it; else compute from IST day
    const week  = parseInt(req.query.week,  10)
               || Math.ceil(istDate.getDate() / 7);

    // 3️⃣ Aggregate exactly as before
    const agg = await Income.aggregate([
      { $addFields: { dateObj: { $toDate: '$date' } } },
      {
        $match: {
          $expr: {
            $and: [
              { $eq: [{ $year: '$dateObj' }, year]   },
              { $eq: [{ $month: '$dateObj' }, month] }
            ]
          }
        }
      },
      { $addFields: { weekInMonth: { $ceil: { $divide: [{ $dayOfMonth: '$dateObj' }, 7] } } } },
      { $match: { weekInMonth: week } },
      { $addFields: { isoWeekday: { $isoDayOfWeek: '$dateObj' } } },
      {
        $group: {
          _id: '$isoWeekday',
          total: { $sum: '$amount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // 4️⃣ Zero‐fill and respond
    const days        = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const dailyTotals = Array(7).fill(0);
    agg.forEach(({ _id: dow, total }) => {
      if (dow >= 1 && dow <= 7) dailyTotals[dow - 1] = total;
    });

    return res.json({ days, totals: dailyTotals });
  }
  catch (err) {
    console.error('Error in eachdayincome:', err);
    return res.status(500).json({ error: 'Server error' });
  }
});


  router.get("/yearlytotalincome" ,async function(req,res){
    try {
    const { year } = req.query;
    const total = await calculateYearlyTotalIncome(year);
    res.json({totalYearlyIncome: total });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
    

  })

  router.get("/dailytotalincome" ,async function(req,res){
   try {
    const { day,month,year } = req.query;
    const total = await calculateDailyTotalIncome(day,month,year);
    res.json({totalDailyIncome: total });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
    
  })
 

module.exports= router;
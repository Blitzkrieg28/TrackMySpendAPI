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
global.totalIncome= 0;
global.totalmonthlyIncome =0;
global.incomeMonth= 0;
global.incomeYear= 0;
global.totalyearlyIncome= 0;
global.totaldailyIncome= 0;
global.incomeDay =0;
//router.use(tokenVerificationMiddleware);

router.get("/viewincome" ,validationMiddleware,async function(req,res){
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
    let {amount,category,date,count} =req.body;
    const existingIncome= await Income.findOne({
        amount:amount,
        category:category,
        date:date
    });
    if(existingIncome){
        await Income.updateOne(
            {
              amount: amount,
              category: category,
              date: date,
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
        count: count
    })
    
      
    res.send({
        message: "income added successfully!!!",
        middlewareMessage: req.authMessage,

    })
    
})

 router.put("/updateincome",validationMiddleware,async function(req,res){
    const {id,amount,category,date,count} =req.body;
    const updateFields = {};
  if (amount !== undefined) updateFields.amount = amount;
  if (category !== undefined) updateFields.category = category;
  if (date !== undefined) updateFields.date = date;
  if (count !== undefined) updateFields.count = count;

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
    //method:1--> Expense.find() is used which fetches whole expense docs data in the server
    const incomes= await Income.find();

    incomes.forEach(function(income){
      totalIncome= totalIncome+((income.amount)*(income.count))
    })

    res.send({
      totalIncome
    })
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
  
    const {month,year}= req.query; 
    const parsedmonth= parseInt(month);
    const parsedyear= parseInt(year);

    const incomes= await Income.find();// fetching all data from database

    incomes.forEach(function(income){
        const incomeDate = new Date(income.date);

        if (
          incomeDate.getMonth() + 1 === parsedmonth && // Match month (0-based index)
          incomeDate.getFullYear() === parsedyear // Match year
        ) {
        incomeMonth=incomeDate.getMonth() + 1;
        incomeYear=incomeDate.getFullYear();
          totalmonthlyIncome += (income.amount*income.count);
        }
    })
    

    res.send({
        totalmonthlyIncome
    })
     console.log(incomeMonth);
     console.log(incomeYear);
  })

  router.get("/yearlytotalincome" ,async function(req,res){
   
    const {year}= req.query; 
    const parsedyear= parseInt(year);

    const incomes= await Income.find();// fetching all data from database

    incomes.forEach(function(income){
        const incomeDate = new Date(income.date);

        if (
          incomeDate.getFullYear() === parsedyear // Match year
        ) {
        incomeYear=incomeDate.getFullYear();
          totalyearlyIncome += (income.amount*income.count);
        }
    })
    

    res.send({
        totalyearlyIncome
    })
     console.log(incomeMonth);
     console.log(incomeYear);
  })

  router.get("/dailytotalincome" ,async function(req,res){
  
    const {day,month,year}= req.query; 
    const parsedday= parseInt(day);
    const parsedmonth= parseInt(month);
    const parsedyear= parseInt(year);

    const incomes= await Income.find();// fetching all data from database

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
    

    res.send({
        totaldailyIncome
    })
     console.log(incomeDay);
     console.log(incomeMonth);
     console.log(incomeYear);
  })
 

module.exports= router;
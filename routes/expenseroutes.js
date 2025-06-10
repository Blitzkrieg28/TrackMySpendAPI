const express= require('express');
const router= express.Router();
const jwt= require('jsonwebtoken');
const JWT_SECRET= 'secret';
const authmiddleware= require('../middlewares/zodauth');
const tokenVerificationMiddleware= require('../middlewares/tokenauth');
const User= require('../database/users');
const Expense= require('../database/expenses');
const validationMiddleware= require('../middlewares/validauth');
global.totalExpense= 0;
global.totalmonthlyExpense= 0;
global.expenseMonth= 0;
global.expenseYear= 0;
global.totalyearlyExpense= 0;
global.totaldailyExpense= 0;
global.expenseDay =0;
//router.use(tokenVerificationMiddleware);

router.get("/viewexpense" ,validationMiddleware,async function(req,res){
    const expenselist= await Expense.find();
    res.send({
        message: "here view your expense list",
        expenselist,
        middlewareMessage: req.authMessage,
    })
    console.log(expenselist);
})

router.post("/addexpense" ,validationMiddleware,async function(req,res){
    let {amount,category,date,count} =req.body;
    const existingExpense= await Expense.findOne({
        amount:amount,
        category:category,
        date:date
    });
    if(existingExpense){
        await Expense.updateOne(
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
            message: "Expense updated successfully!",
            middlewareMessage: req.authMessage,
          });
       

      }

      await Expense.create({
        amount:amount,
        category:category,
        date:date,
        count: count
    })
    
      
    res.send({
        message: "expense added successfully!!!",
        middlewareMessage: req.authMessage,

    })
    
})

 router.put("/updatexpense",validationMiddleware,async function(req,res){
    const {id,amount,category,date,count} =req.body;
    const updateFields = {};
  if (amount !== undefined) updateFields.amount = amount;
  if (category !== undefined) updateFields.category = category;
  if (date !== undefined) updateFields.date = date;
  if (count !== undefined) updateFields.count = count;

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
    const {id,amount,category,date} =req.body;
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
    //method:1--> Expense.find() is used which fetches whole expense docs data in the server
    const expenses= await Expense.find();

    expenses.forEach(function(expense){
      totalExpense= totalExpense+((expense.amount)*(expense.count))
    })

    res.send({
      totalExpense
    })
    //method:2-->
    // const result= await Expense.aggregate([     //aggregate is a pipleine that helps to perform operation in the database itself
    //     {
    //         $group:{   //a pipeline stage which groups the document in the collection Expense based on _id
    //             _id: null, //all documenta are grouped in 1 group no subdivisions into subgroups
    //             totalExpense:{$sum:{$multiply:["$count","$amount"] }},  //operations 
    //         },
    //     },
    // ]);
    // const totalExpense= result[0].totalExpense; //aggregate always return ans in an array


    console.log(totalExpense);
   

  })

  router.get("/monthlytotalexpense" ,async function(req,res){
  
    const {month,year}= req.query; 
    const parsedmonth= parseInt(month);
    const parsedyear= parseInt(year);

    const expenses= await Expense.find();// fetching all data from database

    expenses.forEach(function(expense){
        const expenseDate = new Date(expense.date);

        if (
          expenseDate.getMonth() + 1 === parsedmonth && // Match month (0-based index)
          expenseDate.getFullYear() === parsedyear // Match year
        ) {
        expenseMonth=expenseDate.getMonth() + 1;
        expenseYear=expenseDate.getFullYear();
          totalmonthlyExpense += (expense.amount*expense.count);
        }
    })
    

    res.send({
        totalmonthlyExpense
    })
     console.log(expenseMonth);
     console.log(expenseYear);
  })

  router.get("/yearlytotalexpense" ,async function(req,res){
    const {year}= req.query; 
    
    const parsedyear= parseInt(year);

    const expenses= await Expense.find();// fetching all data from database

    expenses.forEach(function(expense){
        const expenseDate = new Date(expense.date);

        if (
      
          expenseDate.getFullYear() === parsedyear // Match year
        ) {
        
        expenseYear=expenseDate.getFullYear();
          totalyearlyExpense += (expense.amount*expense.count);
        }
    })
    

    res.send({
        totalyearlyExpense
    })
    
     console.log(expenseYear); 
  })

  router.get("/dailytotalexpense" ,async function(req,res){
  
    const {day,month,year}= req.query;
    const parsedday= parseInt(day); 
    const parsedmonth= parseInt(month);
    const parsedyear= parseInt(year);

    const expenses= await Expense.find();// fetching all data from database

    expenses.forEach(function(expense){
        const expenseDate = new Date(expense.date);

        if (
            expenseDate.getDate()===parsedday&&
          expenseDate.getMonth() + 1 === parsedmonth && // Match month (0-based index)
          expenseDate.getFullYear() === parsedyear // Match year
        ) {
         expenseDay=expenseDate.getDate();
        expenseMonth=expenseDate.getMonth() + 1;
        expenseYear=expenseDate.getFullYear();
          totaldailyExpense += (expense.amount*expense.count);
        }
    })
    

    res.send({
        totaldailyExpense
    })
     console.log(expenseDay);
     console.log(expenseMonth);
     console.log(expenseYear);
  })
 

module.exports= router;
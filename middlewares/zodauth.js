const express= require('express');
const app= express();
const jwt= require('jsonwebtoken');
const JWT_SECRET= 12345;
const zod= require('zod');
const schema1= zod.string().email();
const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
// Create a custom Zod schema to validate if a string contains special characters
const schema2 = zod.string().min(5).max(10).refine(value => specialCharPattern.test(value));

const authmiddleware=(function (req,res,next){
   console.log("authenticating....");
   const username= req.body.username;
   const password= req.body.password;
   const response1=schema1.safeParse(username);
   const response2= schema2.safeParse(password);
   if(response1.success && response2.success){
      console.log("middleware validation successfull!!!");
       req.authMessage=  "middleware validation successfull!!"
   }
   else{
       res.status(404).send({
          message: "invalid inputs,if new-> sign-up first!!!"
       })
       console.log("middleware validation failed!!!");
       return;
   }   

next();
})

module.exports= authmiddleware;

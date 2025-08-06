const express= require('express');
const app= express();
const jwt= require('jsonwebtoken');
const JWT_SECRET= 12345;
const zod= require('zod');
const emailSchema= zod.string().email();
const nameSchema= zod.string().min(2).max(50);
const specialCharPattern = /[!@#$%^&*(),.?":{}|<>]/;
// Create a custom Zod schema to validate if a string contains special characters
const passwordSchema = zod.string().min(5).max(10).refine(value => specialCharPattern.test(value));

const authmiddleware=(function (req,res,next){
   console.log("authenticating....");
   
   // Check if this is a sign-up request (has name field) or sign-in request (only email)
   const isSignUp = req.body.hasOwnProperty('name');
   
   if (isSignUp) {
     // Sign-up validation: name, email, password
     const { name, email, password } = req.body;
     const nameResponse = nameSchema.safeParse(name);
     const emailResponse = emailSchema.safeParse(email);
     const passwordResponse = passwordSchema.safeParse(password);
     
     if(nameResponse.success && emailResponse.success && passwordResponse.success){
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
   } else {
     // Sign-in validation: email, password
     const { email, password } = req.body;
     const emailResponse = emailSchema.safeParse(email);
     const passwordResponse = passwordSchema.safeParse(password);
     
     if(emailResponse.success && passwordResponse.success){
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
   }

next();
})

module.exports= authmiddleware;

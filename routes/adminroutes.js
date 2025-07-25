const express= require('express');
const router= express.Router();
const jwt= require('jsonwebtoken');
const JWT_SECRET= 'secret';
const authmiddleware= require('../middlewares/zodauth');
const tokenVerificationMiddleware= require('../middlewares/tokenauth');
const User= require('../database/users');
const Admin= require('../database/admin');
const mongoose= require('../database/database');

/**
 * @swagger
 * /admin/signin:
 *   post:
 *     summary: Admin login
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Admin login successful
 *       403:
 *         description: Admin not found
 */

router.post("/signin" ,authmiddleware,async function(req,res){
    console.log("now,checking if admin exists??");
    const username= req.body.username;
    const password= req.body.password;
    const existingAdmin= await Admin.findOne({
        username: username,
        password: password
 })

    if(existingAdmin){
        const token= jwt.sign({
            username: existingAdmin.username
        },JWT_SECRET);
        res.send({
            middlewareMessage: req.authMessage,
            token,
            message: "you got a token for your sign-in!!!"
        })
        console.log("admin exists!!!");
        //console.log(ADMINS);
    }
    else{
        res.status(403).send({
            message: "admin not found!!"
        })
        console.log("admin not found");
    }
    


})



router.get("/userlist" , async function(req,res){
    const users=  await User.find();
    res.send({
      users
        
    })
    console.log("i have entered in userlist page");
   // console.log(USERS);
})



module.exports= router;



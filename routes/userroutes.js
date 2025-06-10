const express= require('express');
const router= express.Router();
const jwt= require('jsonwebtoken');
const dotenv= require('dotenv');
dotenv.config()
const JWT_SECRET=  process.env.JWT_SECRET;
const authmiddleware= require('../middlewares/zodauth');
const tokenVerificationMiddleware= require('../middlewares/tokenauth');
const User= require('../database/users');
const mongoose= require('../database/database');

/**
 * @swagger
 * /user/signin:
 *   post:
 *     summary: Sign in as a user
 *     tags: [User]
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
 *         description: Login successful with token
 *       403:
 *         description: Invalid credentials
 */

router.post("/signin" ,authmiddleware,async function(req,res){
    console.log("now,checking if user exists??");
    const username= req.body.username;
    const password= req.body.password;
    const userExists = await User.findOne({
        username: username,
        password: password
        })

    if(userExists){
        const token= jwt.sign({
            username: userExists.username
        },JWT_SECRET);
        res.send({
            middlewareMessage: req.authMessage,
            token,
            message: "you got a token for your sign-in!!!"
        })
        console.log("user exists!!!");
        
    }
    else{
        res.status(403).send({
            message: "user not found!!"
        })
        console.log("user not found");
    }
    


})
/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [User]
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
 *                 example: john_doe
 *               password:
 *                 type: string
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Sign-up successful
 *       404:
 *         description: User already exists
 */

router.post("/signup",authmiddleware, async function(req,res){
    const username= req.body.username;
    const password= req.body.password;
    
    const userExists = await User.findOne({
        username: username,
        })

    if (userExists) {
        return res.status(404).send({
            message: "user with the same username/password exists, try with another one!!"
        });
    }

   const newUser= await User.create({
    username: username,
    password: password
   })

    const token = jwt.sign({
        username
    }, JWT_SECRET);

    res.send({
        middlewareMessage: req.authMessage,
        message: "sign-up successfully!!",
        token
    });
    console.log("sign-up successfully!!");

   
})

router.get("/aboutme" ,tokenVerificationMiddleware, function(req,res){
    res.send({
        message: `Welcome, ${req.user.username}!`,
        data: req.user
    })
    console.log("i have entered in aboutme page");
})





module.exports=router;


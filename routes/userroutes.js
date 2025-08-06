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
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful with token
 *       403:
 *         description: Invalid credentials
 */
// routes/auth.js

// SIGN IN
router.post('/signin', authmiddleware, async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });
  if (!user) {
    return res.status(403).json({ message: 'Invalid credentials' });
  }

  // 1️⃣ Sign with the user ID (not just email)
  const token = jwt.sign(
    { id: user._id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  // 2️⃣ Return it in the response
  res.json({
    middlewareMessage: req.authMessage,
    token,
    message: 'Sign-in successful'
  });
});

// SIGN UP
router.post('/signup', authmiddleware, async (req, res) => {
  const { name, email, password } = req.body;

  if (await User.findOne({ email })) {
    return res.status(409).json({ message: 'Email already taken' });
  }

  const newUser = await User.create({ name, email, password });

  // sign a token with their new user ID
  const token = jwt.sign(
    { id: newUser._id, email: newUser.email, name: newUser.name },
    JWT_SECRET,
    { expiresIn: '1h' }
  );

  res.status(201).json({
    middlewareMessage: req.authMessage,
    message: 'Sign-up successful',
    token
  });
});

module.exports = router;

router.get("/aboutme" ,tokenVerificationMiddleware, function(req,res){
    res.send({
        message: `Welcome, ${req.user.name}!`,
        data: req.user
    })
    console.log("i have entered in aboutme page");
})





module.exports=router;


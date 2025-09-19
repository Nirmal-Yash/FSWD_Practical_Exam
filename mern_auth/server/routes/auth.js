const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();
const JWT_EXPIRES = 24*60*60*1000; // 1 day

// Register
router.post('/register', 
  [ body('name').notEmpty(), body('email').isEmail(), body('password').isLength({min:6}) ],
  async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password } = req.body;
    try {
      if (await User.findOne({ email })) return res.status(400).json({ message:'Email exists' });
      const user = await User.create({ name, email, password });
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: JWT_EXPIRES
      });
      res.status(201).json({ message: 'Registered' });
    } catch (err) { res.status(500).json({ message: err.message }); }
  }
);

// Login
router.post('/login', async (req,res)=>{
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: JWT_EXPIRES
    });
    res.json({ message: 'Logged in' });
  } catch(err){ res.status(500).json({ message: err.message }); }
});

// Middleware to protect routes
function authMiddleware(req,res,next){
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
}

// Get current user
router.get('/me', authMiddleware, async (req,res)=>{
  const user = await User.findById(req.userId).select('-password');
  res.json(user);
});

// Logout
router.post('/logout', (req,res)=>{
  res.clearCookie('token', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
  res.json({ message: 'Logged out' });
});

module.exports = router;

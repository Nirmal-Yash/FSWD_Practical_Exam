require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();
app.use(helmet());
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));

// Basic rate limiter
app.use(rateLimit({ windowMs: 60*1000, max: 100 }));

// TODO: mount auth routes here
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

mongoose.connect(process.env.MONGO_URI, {useNewUrlParser:true, useUnifiedTopology:true})
  .then(()=> app.listen(process.env.PORT || 5000, ()=> console.log('Server running')))
  .catch(err => console.error(err));

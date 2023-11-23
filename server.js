// modules
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const https = require('https');
const fs = require('fs');
const path = require('path')
const { body, validationResult } = require('express-validator');
require('dotenv').config();

// express
const app = express();

// session
const sessionConfig = {
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
}

// passport 
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// login
app.post('/login', [
  body('username').isLength({ min: 3 }).trim().escape(),
  body('password').isLength({ min: 5 }).trim().escape()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { username, password } = req.body;
  console.log('Validated Login Attempt:', username, password);
  res.send('Login validated');
});

// auth routes
const authRoutes = require('./routes/auth');
app.use('/', authRoutes);

// user routes
const userRoutes = require('./routes/userRoutes');
app.use('/users', userRoutes);

// https
const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH)
};

// https server
https.createServer(httpsOptions, app).listen(3000, () => {
  console.log('running...')
});
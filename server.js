const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const app = express();

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended:true }));

// serve
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// post route for login
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

// start
app.listen(3000, () => {
    console.log('ztfo is running on port 3000')
});
// modules
const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
require('./passport-config')(passport);
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const { Pool } = require('pg');
const LocalStrategy = require('passport-local').Strategy;
const User = require('./models/user');
const PendingUser = require('./models/pendingUser');
const fs = require('fs');
const path = require('path');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const winston = require('winston');
// const https = require('https');
require('dotenv').config();

// express
const app = express();

// view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// logs
const logger = winston.createLogger({
  level: 'debug',
  format: winston.format.json(),
  defaultMeta: { service: 'user-service' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});

// security headers
app.use((req, res, next) => {
  // Generate a nonce
  req.nonce = crypto.randomBytes(16).toString('base64');

  next();
});

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", (req, res) => `'nonce-${req.nonce}'`],
      styleSrc: ["'self'"],
      imgSrc: ["'self'", "data:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// session store
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// session
app.use(session({
  store: new pgSession({
    pool: pool,
    tableName: 'session',
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

// limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Get outta here.',
});

app.use(limiter);

// middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// passport
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (err, req, res, next) {
  logger.error(err.stack);
  res.status(500).send('ah, shite!');
});

// serve
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

// auth routes
const authRoutes = require('./routes/authRoutes.js');
app.use('/', authRoutes);

// user routes
const userRoutes = require('./routes/userRoutes.js');
app.use('/users', userRoutes);

// admin routes
const adminRoutes = require('./routes/adminRoutes.js');
app.use('/admin', adminRoutes);

app.listen(3000, () => {
  console.log('running...');
});

// // https
// const httpsOptions = {
//   key: fs.readFileSync(process.env.SSL_KEY_PATH),
//   cert: fs.readFileSync(process.env.SSL_CERT_PATH),
// };

// // https server
// https.createServer(httpsOptions, app).listen(3000, () => {
//   console.log('running...');
// });

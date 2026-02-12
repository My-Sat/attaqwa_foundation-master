require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Persistent session store
const mongoose = require('mongoose');
const flash = require('express-flash'); // Import express-flash
const Message = require('./models/messages');
const { startAccessExpiryReminderWorker } = require('./services/accessExpiryReminder');

const attaqwaRouter = require("./routes/attaqwa_foundation");
const usersRouter = require('./routes/users');

const app = express();

// Set up mongoose connection
mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGODB_URI || "your-mongo-uri-here";

mongoose.connect(mongoDB)
  .then(() => {
    console.log('MongoDB connected');
    startAccessExpiryReminderWorker();
  })
  .catch(err => console.error('MongoDB connection error:', err));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Middleware
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/', express.static(path.join(__dirname, 'public')));

// Session middleware with MongoDB store
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-default-secret',
  resave: false,
  saveUninitialized: false, // Only save sessions when modified
  store: MongoStore.create({
    mongoUrl: mongoDB,
    collectionName: 'sessions',
  }),
  cookie: {
    secure: false, // Set to `true` if using HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 1 day
  },
}));

// Initialize flash middleware
app.use(flash());

// Middleware to set local variables for dynamic navigation layout (excluding req.flash here)
app.use(async (req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn || false;
  res.locals.admin = req.session.admin || null;
  res.locals.user = req.session.user || null;

  // Check for unread messages if the user is logged in
  if (req.session.user) {
    try {
      const userId = req.session.user.id;
      const [unreadCount, navMessages] = await Promise.all([
        Message.countDocuments({ userId, isRead: false }),
        Message.find({ userId })
          .sort({ createdAt: -1 })
          .limit(6)
          .select('question answer kind isRead createdAt'),
      ]);
      res.locals.unreadMessages = unreadCount; // Attach the unread messages count to the view
      res.locals.navMessages = navMessages.map((item) => ({
        id: String(item._id),
        subject: item.question || '',
        preview: item.answer || '',
        kind: item.kind || 'qa',
        isRead: Boolean(item.isRead),
        createdAt: item.createdAt || null,
      }));
    } catch (err) {
      console.error('Error fetching unread messages:', err);
      res.locals.unreadMessages = 0; // Fail gracefully
      res.locals.navMessages = [];
    }
  } else {
    res.locals.unreadMessages = 0; // No messages for guests
    res.locals.navMessages = [];
  }

  next();
});

// Routes
app.use('/', attaqwaRouter);
app.use('/users', usersRouter);

// Error handling
app.use((req, res, next) => {
  next(createError(404));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

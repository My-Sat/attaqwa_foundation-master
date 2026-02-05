const { validationResult } = require('express-validator'); // Import express-validator
const asyncHandler = require('express-async-handler');
const Message = require("../models/messages");
const User = require('../models/users');
const bcrypt = require('bcryptjs');
  
exports.getUserSignUp = (req, res) => {
    res.render('signup_user', {
      title: 'User Sign Up',
      errors: [],
      oldInput: { username: '', phoneNumber: '' },
    });
  };
    
// User Sign-Up Logic
exports.postUserSignUp = asyncHandler(async (req, res) => {
  const { username, phoneNumber, password } = req.body;

  // Validate request fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('signup_user', {
      title: 'User Sign Up',
      errors: errors.array(),
      oldInput: { username: username || '', phoneNumber: phoneNumber || '' },
    });
  }

  // Normalize the username to lowercase
  const normalizedUsername = username.toLowerCase();

  // Check for existing username or phone number
  const existingPhoneNumber = await User.findOne({ phoneNumber });
  const existingUser = await User.findOne({ username: normalizedUsername });

  if (existingPhoneNumber || existingUser) {
    return res.status(400).render('signup_user', {
      title: 'User Sign Up',
      errors: [
        existingPhoneNumber
          ? { msg: 'Phone number is already registered' }
          : { msg: 'Username is already taken' },
      ],
      oldInput: { username, phoneNumber },
    });
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the new user
  const newUser = new User({
    username: normalizedUsername,
    phoneNumber,
    password: hashedPassword,
  });
  await newUser.save();

  res.redirect('/user_signup_success');
});

      //Success sign up for user
exports.getUserSignUpSuccess = (req, res) => {
  res.render('userSignUpSuccess', {
    title: 'Signup Successful'
  });
};
  
  // GET: Render Sign In Page
exports.getSignInPage = asyncHandler(async (req, res) => {
    res.render('signin', { title: 'Sign In' });
  });

// User Sign-In Logic
exports.postUserSignIn = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  // Validate input
  if (!username || !password) {
    return res.status(401).render('signin', {
      title: 'Sign In',
      userError: 'Username and password are required.',
    });
  }

  // Normalize the username to lowercase for comparison
  const normalizedUsername = username.toLowerCase();

  // Find the user in the database
  const user = await User.findOne({ username: normalizedUsername });
  if (!user) {
    return res.status(401).render('signin', {
      title: 'Sign In',
      userError: 'Invalid username or password.',
    });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).render('signin', {
      title: 'Sign In',
      userError: 'Invalid username or password.',
    });
  }

  // Save user session data
  req.session.isLoggedIn = true;
  req.session.user = {
    id: user._id,
    username: user.username,
  };

  // Redirect to home
  res.redirect('/');
});  

//GET: User messages
exports.getUserMessages = asyncHandler(async (req, res) => {
  const userId = req.session.user?.id; // Retrieve logged-in user's ID
  const messages = await Message.find({ userId }).sort({ createdAt: -1 });

  // Mark all messages as read
  await Message.updateMany({ userId, isRead: false }, { isRead: true });

  res.render('userMessages', {
    title: 'Your Messages',
    messages,
  });
});

const { validationResult } = require('express-validator'); // Import express-validator
const asyncHandler = require('express-async-handler');
const Message = require("../models/messages");
const User = require('../models/users');
const bcrypt = require('bcryptjs');
  
exports.getUserSignUp = (req, res) => {
  res.render('signup_user', {
    title: 'User Sign Up',
    errors: [],
    oldInput: {
      firstName: '',
      surname: '',
      otherNames: '',
      phoneNumber: '',
      username: '',
    },
  });
};
    
// User Sign-Up Logic
exports.postUserSignUp = asyncHandler(async (req, res) => {
  const {
    firstName,
    surname,
    otherNames,
    username,
    phoneNumber,
    password,
  } = req.body;

  const normalizedUsername = (username || '').trim().toLowerCase();
  const formattedPhoneNumber = (phoneNumber || '').trim();

  // Validate request fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render('signup_user', {
      title: 'User Sign Up',
      errors: errors.array(),
      oldInput: {
        firstName: firstName || '',
        surname: surname || '',
        otherNames: otherNames || '',
        username: username || '',
        phoneNumber: phoneNumber || '',
      },
    });
  }

  // Check for existing username or phone number
  const existingPhoneNumber = await User.findOne({ phoneNumber: formattedPhoneNumber });
  const existingUser = await User.findOne({ username: normalizedUsername });

  if (existingPhoneNumber || existingUser) {
    return res.status(400).render('signup_user', {
      title: 'User Sign Up',
      errors: [
        existingPhoneNumber
          ? { msg: 'Phone number is already registered' }
          : { msg: 'Username is already taken' },
      ],
      oldInput: {
        firstName: firstName || '',
        surname: surname || '',
        otherNames: otherNames || '',
        username: username || '',
        phoneNumber: phoneNumber || '',
      },
    });
  }

  // Hash the password before saving
  const hashedPassword = await bcrypt.hash(password, 10);

  // Save the new user
  const newUser = new User({
    firstName: (firstName || '').trim(),
    surname: (surname || '').trim(),
    otherNames: (otherNames || '').trim(),
    username: normalizedUsername,
    phoneNumber: formattedPhoneNumber,
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
  
//GET: User messages
exports.getUserMessages = asyncHandler(async (req, res) => {
  const userId = req.session.user?.id; // Retrieve logged-in user's ID

  if (!userId) {
    return res.redirect('/signin');
  }

  // Mark all messages as read
  await Message.updateMany({ userId, isRead: false }, { isRead: true });
  const messages = await Message.find({ userId }).sort({ createdAt: -1 });

  // Ensure the current response nav badge clears immediately.
  res.locals.unreadMessages = 0;

  res.render('userMessages', {
    title: 'Your Messages',
    messages,
  });
});

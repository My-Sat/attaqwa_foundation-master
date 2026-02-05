const Registration = require('../models/class_registration');
const Message = require('../models/messages');
const ClassSession = require('../models/class_session');
const RegistrationFee = require('../models/registrationFee');
const asyncHandler = require('express-async-handler');

// GET: Display form for adding new class session
exports.getAddClassSession = asyncHandler(async (req, res) => {
  const success = req.flash('success');
  const error = req.flash('error');

  res.render('addClassSession', {
    title: 'Add Class Session',
    success,
    error,
  });
});

// POST: Add a session
exports.postAddClassSession = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title) {
    req.flash('error', 'Session title is required.');
    return res.redirect('/add_session');
  }

  try {
    await ClassSession.create({ title });
    req.flash('success', 'Session added successfully!');
    res.redirect('/add_session');
  } catch (err) {
    req.flash('error', 'Failed to add session. Please try again later.');
    res.redirect('/add_session');
  }
});

// GET: Display registration form
exports.getClassSessionRegistration = asyncHandler(async (req, res) => {
  const success = req.flash('success');
  const error = req.flash('error');
  const classSessions = await ClassSession.find();
  const fee = await RegistrationFee.findOne();

  res.render('session_registration', {
    title: 'Register for Class Session',
    classSessions,
    success,
    error,
    fee,
  });
});

  // POST: Handle registration form submission
  exports.postClassSessionRegistration = asyncHandler(async (req, res) => {
    const { sessionId, momoReference } = req.body;
    const userId = req.session.user.id;
    
    if (!sessionId || !momoReference) {
      req.flash('error', 'All fields are required.');
      return res.redirect('/register');
    }
    
    try {
      await Registration.create({
        userId,
        classSessionId: sessionId,
        momoReferenceName: momoReference,
      });
      req.flash('success', 'Registration successful, patiently wait for Admin to assign an access code to you, check your attaqwa message box for the code .');
      res.redirect('/register');
    } catch (err) {
      console.error('Registration error:', err);
      req.flash('error', 'Registration failed. Please try again later.');
      res.redirect('/register');
    }
      });
  
  // GET: Display all pending registrations
  exports.getPendingRegistrations = asyncHandler(async (req, res) => {
    const success = req.flash('success');
    const error = req.flash('error');
    const registrations = await Registration.find()
      .populate('userId')
      .populate('classSessionId')
      .sort({ createdAt: -1 });
  
    res.render('admin_session_reg', {
      title: 'Class Session Registration',
      registrations,
      success,
      error,
    });
  });
    
// POST: Assign code to user
exports.postPendingRegistrations = asyncHandler(async (req, res) => {
  const { registrationId, code } = req.body;

  if (!code) {
    req.flash('error', 'Code is required.');
    return res.redirect('/registrations/pending');
  }

  try {
    const registration = await Registration.findById(registrationId).populate('userId');

    if (!registration) {
      req.flash('error', 'Registration not found.');
      return res.redirect('/registrations/pending');
    }

    // Assign the code and set the expiration date
    registration.accessCode = code;
    registration.codeExpiration = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now
    registration.accessCodeAssigned = true;
    await registration.save();

    // Send the code to the user
    await Message.create({
      userId: registration.userId._id,
      question: 'Your class session code is',
      answer: code,
    });

    req.flash('success', 'Code assigned successfully!');
    res.redirect('/registrations/pending');
  } catch (err) {
    req.flash('error', 'Failed to assign code. Please try again later.');
    res.redirect('/registrations/pending');
  }
});
  
  // GET: Display all class sessions
  exports.getAllClassSessions = asyncHandler(async (req, res) => {
    const success = req.flash('success');
    const error = req.flash('error');
    const classSessions = await ClassSession.find();
  
    res.render('all_class_sessions', {
      title: 'Class Sessions',
      classSessions,
      success,
      error,
    });
  });
    
// GET: Display users for a specific class session
exports.getUsersForClassSession = asyncHandler(async (req, res) => {
  const success = req.flash('success');
  const error = req.flash('error');
  const classSessionId = req.params.id;
  const classSession = await ClassSession.findById(classSessionId)
  .populate({
    path: 'users',
    populate: {
      path: 'userId',
      model: 'User',
    },
  });

  if (!classSession) {
    req.flash('error', 'Class session not found.');
    return res.redirect('/class_sessions');
  }

  res.render('class_session_list', {
    title: classSession.title,
    classSession,
    success,
    error,
  });
});

// Display the form for users to submit their access code
exports.getLiveClassAuth = asyncHandler(async (req, res) => {
  res.render('codeSubmission', {
    title: 'Join Live Class',
    success: req.flash('success'),
    error: req.flash('error'),
  });
});

// Handle the form submission
exports.postLiveClassAuth = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const userId = req.session.user.id; // Assuming req.user contains the authenticated user's information

  if (!code) {
    req.flash('error', 'Access code is required.');
    return res.redirect('/live_class_auth');
  }

  try {
    const registration = await Registration.findOne({ userId, accessCode: code }).populate('classSessionId');

    if (!registration) {
      req.flash('error', 'Invalid access code.');
      return res.redirect('/live_class_auth');
    }

    if (registration.codeExpiration < new Date()) {
      req.flash('error', 'Access code has expired.');
      return res.redirect('/live_class_auth');
    }

    // Store the access code in the session to authorize the user for the live class
    req.session.accessCode = code;

    // Redirect to the live class page or render the live class view
    res.redirect('/live_class');
    } catch (err) {
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/live_class_auth');
  }
});
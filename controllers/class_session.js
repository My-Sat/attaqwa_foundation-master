const Registration = require('../models/class_registration');
const ClassSession = require('../models/class_session');
const RegistrationFee = require('../models/registrationFee');
const asyncHandler = require('express-async-handler');

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
    formData: {
      sessionId: '',
      paymentMethod: 'MoMo',
      paymentReference: '',
    },
  });
});

// POST: Handle registration form submission
exports.postClassSessionRegistration = asyncHandler(async (req, res) => {
  const sessionId = (req.body.sessionId || '').trim();
  const paymentMethod = (req.body.paymentMethod || 'Other').trim();
  const paymentReference = (req.body.paymentReference || '').trim();
  const userId = req.session.user.id;

  if (!sessionId || !paymentReference) {
    req.flash('error', 'Session and payment proof are required.');
    return res.redirect('/register');
  }

  const selectedSession = await ClassSession.findById(sessionId);
  if (!selectedSession) {
    req.flash('error', 'Selected session does not exist.');
    return res.redirect('/register');
  }

  const pendingRegistration = await Registration.findOne({
    userId,
    classSessionId: sessionId,
    approved: false,
  });
  if (pendingRegistration) {
    req.flash('error', 'You already have a pending request for this session.');
    return res.redirect('/register');
  }

  const approvedRegistration = await Registration.findOne({
    userId,
    classSessionId: sessionId,
    approved: true,
    accessExpiresAt: { $gt: new Date() },
  });
  if (approvedRegistration) {
    req.flash('success', `You already have active access for this session until ${approvedRegistration.accessExpiresAt.toLocaleString()}.`);
    return res.redirect('/register');
  }

  try {
    await Registration.create({
      userId,
      classSessionId: sessionId,
      paymentMethod: paymentMethod || 'Other',
      paymentReference,
      approved: false,
    });

    req.flash('success', 'Registration submitted. Wait for admin approval to get 30 days access.');
    res.redirect('/register');
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Registration failed. Please try again later.');
    res.redirect('/register');
  }
});

// GET: Display all registrations for approval
exports.getPendingRegistrations = asyncHandler(async (req, res) => {
  const success = req.flash('success');
  const error = req.flash('error');
  const registrations = await Registration.find()
    .populate('userId', 'username')
    .populate('classSessionId', 'title')
    .sort({ createdAt: -1 });

  res.render('admin_session_reg', {
    title: 'Class Session Registration',
    registrations,
    success,
    error,
  });
});

// POST: Approve registration and grant 30-day access
exports.postPendingRegistrations = asyncHandler(async (req, res) => {
  const registrationId = (req.body.registrationId || '').trim();
  if (!registrationId) {
    req.flash('error', 'Registration id is required.');
    return res.redirect('/registrations/pending');
  }

  try {
    const registration = await Registration.findById(registrationId)
      .populate('userId', 'username')
      .populate('classSessionId', 'title');
    if (!registration) {
      req.flash('error', 'Registration not found.');
      return res.redirect('/registrations/pending');
    }

    if (registration.approved && registration.accessExpiresAt && registration.accessExpiresAt > new Date()) {
      req.flash('success', `${registration.userId.username} already has active access until ${registration.accessExpiresAt.toLocaleString()}.`);
      return res.redirect('/registrations/pending');
    }

    const now = new Date();
    registration.approved = true;
    registration.approvedAt = now;
    registration.accessExpiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    await registration.save();

    req.flash('success', `Approved ${registration.userId.username} for ${registration.classSessionId.title}. Access is active for 30 days.`);
    res.redirect('/registrations/pending');
  } catch (err) {
    console.error('Approval error:', err);
    req.flash('error', 'Failed to approve registration. Please try again later.');
    res.redirect('/registrations/pending');
  }
});

// Backward compatibility route
exports.getLiveClassAuth = asyncHandler(async (req, res) => {
  res.redirect('/live_class');
});

// Backward compatibility route
exports.postLiveClassAuth = asyncHandler(async (req, res) => {
  res.redirect('/live_class');
});

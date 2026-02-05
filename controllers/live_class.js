const asyncHandler = require('express-async-handler');
const Registration = require('../models/class_registration');

exports.getLiveClass = asyncHandler(async (req, res) => {
  const { accessCode } = req.session;
  const userId = req.session.user.id; // Assuming req.user contains the authenticated user's information

  if (!accessCode) {
    req.flash('error', 'Access code is required to join the live class.');
    return res.redirect('/live_class_auth');
  }

  const registration = await Registration.findOne({ userId, accessCode }).populate('classSessionId');

  if (!registration) {
    req.flash('error', 'Invalid access code.');
    return res.redirect('/live_class_auth');
  }

  if (registration.codeExpiration < new Date()) {
    req.flash('error', 'Access code has expired.');
    return res.redirect('/live_class_auth');
  }

  res.render('live_class', {
    title: 'Live Class',
    classSession: registration.classSessionId,
  });
});


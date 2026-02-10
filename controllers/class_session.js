const Registration = require('../models/class_registration');
const ClassSession = require('../models/class_session');
const asyncHandler = require('express-async-handler');
const axios = require('axios');
const { getNextSessionStart, getScheduleSummary, getNormalizedSchedule } = require('../utils/sessionSchedule');

function normalizePhoneNumber(phoneNumberInput) {
  const raw = String(phoneNumberInput || '').trim();
  if (!raw) {
    return '';
  }

  const digitsOnly = raw.replace(/\D/g, '');

  if (digitsOnly.startsWith('233') && digitsOnly.length === 12) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.startsWith('0') && digitsOnly.length === 10) {
    return `+233${digitsOnly.slice(1)}`;
  }

  if (raw.startsWith('+')) {
    return `+${digitsOnly}`;
  }

  if (digitsOnly.length >= 10) {
    return `+${digitsOnly}`;
  }

  return raw;
}

async function sendHubtelSessionApprovalSMS(phoneNumberInput, smsMessage) {
  const endpoint = process.env.HUBTEL_SMS_ENDPOINT || 'https://smsc.hubtel.com/v1/messages/send';
  const clientId = process.env.HUBTEL_CLIENT_ID || '';
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET || '';
  const senderId = process.env.HUBTEL_SENDER_ID || '';
  const phoneNumber = normalizePhoneNumber(phoneNumberInput);

  if (!clientId || !clientSecret || !senderId) {
    throw new Error('Hubtel SMS settings are missing.');
  }

  if (!phoneNumber) {
    throw new Error('User phone number is missing.');
  }

  const requestPayload = {
    clientid: clientId,
    clientsecret: clientSecret,
    from: senderId,
    to: phoneNumber,
    content: smsMessage,
  };

  try {
    await axios.get(endpoint, {
      params: requestPayload,
      timeout: 15000,
    });
  } catch (getError) {
    await axios.post(endpoint, requestPayload, {
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// GET: Display registration form
exports.getClassSessionRegistration = asyncHandler(async (req, res) => {
  const noticeType = (req.query.liveClassNotice || '').trim();
  const liveClassNotice = noticeType === 'no_access'
    ? 'You currently do not have access to the active live class. Register and wait for admin approval.'
    : '';
  const success = req.flash('success');
  const error = req.flash('error');
  const classSessions = await ClassSession.find().sort({ title: 1 });
  const sessionOptions = classSessions.map((session) => ({
    _id: session._id,
    title: session.title,
    price: Number.isFinite(Number(session.price)) ? Number(session.price) : 0,
    scheduleSummary: getScheduleSummary(session),
  }));

  res.render('session_registration', {
    title: 'Register for Class Session',
    classSessions: sessionOptions,
    success,
    error,
    liveClassNotice,
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
      sessionPrice: Number.isFinite(Number(selectedSession.price)) ? Number(selectedSession.price) : 0,
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
    .populate('classSessionId', 'title price')
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
      .populate('userId', 'username phoneNumber')
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

    const approvedAtText = registration.approvedAt ? registration.approvedAt.toLocaleString() : 'now';
    const expiresAtText = registration.accessExpiresAt ? registration.accessExpiresAt.toLocaleString() : 'N/A';
    const smsText = `As-salaam alaikum. Your class registration is approved. Session: ${registration.classSessionId.title}. Approved: ${approvedAtText}. Access valid until: ${expiresAtText}.`;

    let smsDeliveryFailed = false;
    try {
      await sendHubtelSessionApprovalSMS(registration.userId && registration.userId.phoneNumber ? registration.userId.phoneNumber : '', smsText);
    } catch (smsError) {
      smsDeliveryFailed = true;
      console.error('Session approval SMS error:', smsError.message);
    }

    req.flash('success', `Approved ${registration.userId.username} for ${registration.classSessionId.title}. Access is active for 30 days.`);
    if (smsDeliveryFailed) {
      req.flash('error', `Approval succeeded, but SMS alert could not be sent to ${registration.userId.username}.`);
    }
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

// GET: Display logged-in user's class session records
exports.getMyClassSessions = asyncHandler(async (req, res) => {
  const userId = req.session.user.id;
  const now = new Date();

  const registrations = await Registration.find({ userId })
    .populate('classSessionId', 'title price schedule')
    .sort({ createdAt: -1 });

  const records = registrations.map((registration) => {
    let status = 'Pending Approval';
    if (registration.approved) {
      status = registration.accessExpiresAt && registration.accessExpiresAt > now
        ? 'Approved'
        : 'Expired';
    }

    const sessionData = registration.classSessionId;
    const normalizedSchedule = sessionData ? getNormalizedSchedule(sessionData) : null;
    const nextSessionStartAt = sessionData && status === 'Approved'
      ? getNextSessionStart(sessionData)
      : null;

    return {
      sessionTitle: sessionData ? sessionData.title : 'Unknown Session',
      sessionPrice: Number.isFinite(Number(registration.sessionPrice))
        ? Number(registration.sessionPrice)
        : (sessionData && Number.isFinite(Number(sessionData.price)) ? Number(sessionData.price) : 0),
      paymentMethod: registration.paymentMethod || 'Other',
      paymentReference: registration.paymentReference || 'N/A',
      scheduleSummary: sessionData ? getScheduleSummary(sessionData) : 'N/A',
      durationMinutes: normalizedSchedule ? normalizedSchedule.durationMinutes : null,
      nextSessionStartAt: nextSessionStartAt || null,
      scheduleStartDate: normalizedSchedule && normalizedSchedule.startDate ? normalizedSchedule.startDate : null,
      scheduleStartTime: normalizedSchedule ? normalizedSchedule.startTime : null,
      scheduleFrequency: normalizedSchedule ? normalizedSchedule.frequency : null,
      scheduleWeekDays: normalizedSchedule ? normalizedSchedule.weekDays : [],
      status,
      registeredAt: registration.createdAt || null,
      approvedAt: registration.approvedAt || null,
      accessExpiresAt: registration.accessExpiresAt || null,
    };
  });

  res.render('my_class_sessions', {
    title: 'My Class Sessions',
    records,
  });
});

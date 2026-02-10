const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const axios = require('axios');
const Admin = require('../models/admin');
const User = require('../models/users');
const PasswordResetToken = require('../models/password_reset_token');

function renderSignIn(res, username = '', signInError = '', signInSuccess = '') {
  return res.status(signInError ? 401 : 200).render('signin', {
    title: 'Sign In',
    signInError,
    signInSuccess,
    oldInput: { username },
  });
}

function establishSessionAndRedirect(req, res, authResult) {
  req.session.regenerate((regenErr) => {
    if (regenErr) {
      console.error('Session regeneration error:', regenErr);
      return res.status(500).send('An error occurred. Please try again.');
    }

    req.session.isLoggedIn = true;
    req.session.admin = authResult.admin;
    req.session.user = authResult.user;

    req.session.save((saveErr) => {
      if (saveErr) {
        console.error('Session save error:', saveErr);
        return res.status(500).send('An error occurred. Please try again.');
      }

      return res.redirect(authResult.redirectTo);
    });
  });
}

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

function getPhoneSearchCandidates(phoneNumberInput) {
  const raw = String(phoneNumberInput || '').trim();
  const digits = raw.replace(/\D/g, '');
  const set = new Set();

  if (raw) {
    set.add(raw);
  }

  if (digits) {
    set.add(digits);
    set.add(`+${digits}`);
  }

  if (digits.startsWith('0') && digits.length === 10) {
    const localNoLeadingZero = digits.slice(1);
    set.add(digits);
    set.add(`+233${localNoLeadingZero}`);
    set.add(`233${localNoLeadingZero}`);
  }

  if (digits.startsWith('233') && digits.length === 12) {
    const localPart = digits.slice(3);
    set.add(`+${digits}`);
    set.add(`0${localPart}`);
  }

  return Array.from(set).filter(Boolean);
}

function phonesMatch(storedPhone, inputPhone) {
  const normalizeForCompare = (value) => String(value || '').replace(/\D/g, '');
  return normalizeForCompare(storedPhone) === normalizeForCompare(inputPhone);
}

function hashResetCode(code) {
  return crypto.createHash('sha256').update(String(code)).digest('hex');
}

function generateResetCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendHubtelResetCodeSMS(phoneNumber, code) {
  const endpoint = process.env.HUBTEL_SMS_ENDPOINT || 'https://smsc.hubtel.com/v1/messages/send';
  const clientId = process.env.HUBTEL_CLIENT_ID || '';
  const clientSecret = process.env.HUBTEL_CLIENT_SECRET || '';
  const senderId = process.env.HUBTEL_SENDER_ID || '';

  if (!clientId || !clientSecret || !senderId) {
    throw new Error('SMS service is not configured. Missing Hubtel environment variables.');
  }

  const smsMessage = `Your At-Taqwa password reset code is ${code}. Expires in 10 minutes.`;

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

function renderForgotPassword(res, options) {
  const {
    error = [],
    success = [],
    step = 'request',
    requestId = '',
    oldInput = {},
  } = options || {};

  return res.status(200).render('forgot_password', {
    title: 'Forgot Password',
    error,
    success,
    step,
    requestId,
    oldInput: {
      phoneNumber: oldInput.phoneNumber || '',
    },
  });
}

exports.getSignInPage = asyncHandler(async (req, res) => {
  if (req.session?.admin) {
    return res.redirect('/dashboard');
  }

  if (req.session?.user) {
    return res.redirect('/');
  }

  const successMessages = req.flash('success');
  return renderSignIn(res, '', '', successMessages && successMessages.length ? successMessages[0] : '');
});

exports.postSignIn = asyncHandler(async (req, res) => {
  const username = (req.body.username || '').trim().toLowerCase();
  const password = req.body.password || '';

  if (!username || !password) {
    return renderSignIn(res, username, 'Username and password are required.');
  }

  const [admin, user] = await Promise.all([
    Admin.findOne({ username }),
    User.findOne({ username }),
  ]);

  let authResult = null;

  if (admin && await bcrypt.compare(password, admin.password)) {
    authResult = {
      role: 'admin',
      redirectTo: '/dashboard',
      admin: {
        id: admin._id,
        username: admin.username,
      },
      user: null,
    };
  } else if (user && await bcrypt.compare(password, user.password)) {
    authResult = {
      role: 'user',
      redirectTo: '/',
      admin: null,
      user: {
        id: user._id,
        username: user.username,
      },
    };
  }

  if (!authResult) {
    return renderSignIn(res, username, 'Invalid username or password.');
  }

  return establishSessionAndRedirect(req, res, authResult);
});

exports.getForgotPasswordPage = asyncHandler(async (req, res) => {
  if (req.session?.admin) {
    return res.redirect('/dashboard');
  }

  if (req.session?.user) {
    return res.redirect('/');
  }

  return renderForgotPassword(res, {
    step: 'request',
  });
});

exports.postForgotPasswordRequest = asyncHandler(async (req, res) => {
  const phoneNumberInput = (req.body.phoneNumber || '').trim();
  const normalizedPhone = normalizePhoneNumber(phoneNumberInput);
  const phoneCandidates = getPhoneSearchCandidates(phoneNumberInput);

  if (!phoneNumberInput) {
    return renderForgotPassword(res, {
      error: ['Phone number is required.'],
      step: 'request',
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  const [adminAccount, userAccount] = await Promise.all([
    Admin.findOne({ phoneNumber: { $in: phoneCandidates } }),
    User.findOne({ phoneNumber: { $in: phoneCandidates } }),
  ]);

  if (adminAccount && userAccount) {
    return renderForgotPassword(res, {
      error: ['Multiple accounts match this phone number. Contact support to reset password.'],
      step: 'request',
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  let targetAccount = null;
  let accountType = '';

  if (adminAccount) {
    targetAccount = adminAccount;
    accountType = 'admin';
  } else if (userAccount) {
    targetAccount = userAccount;
    accountType = 'user';
  }

  if (!targetAccount) {
    return renderForgotPassword(res, {
      error: ['No account matched the provided phone number.'],
      step: 'request',
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  await PasswordResetToken.deleteMany({
    accountType,
    accountId: targetAccount._id,
    usedAt: null,
  });

  const resetCode = generateResetCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const token = await PasswordResetToken.create({
    accountType,
    accountId: targetAccount._id,
    phoneNumber: normalizePhoneNumber(targetAccount.phoneNumber),
    codeHash: hashResetCode(resetCode),
    expiresAt,
  });

  try {
    await sendHubtelResetCodeSMS(token.phoneNumber, resetCode);
  } catch (error) {
    await PasswordResetToken.findByIdAndDelete(token._id);
    console.error('Hubtel SMS send error:', error.message);
    return renderForgotPassword(res, {
      error: ['Unable to send reset code at the moment. Please try again.'],
      step: 'request',
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  return renderForgotPassword(res, {
    success: ['Verification code sent to your phone number.'],
    step: 'verify',
    requestId: String(token._id),
    oldInput: { phoneNumber: phoneNumberInput },
  });
});

exports.postForgotPasswordVerify = asyncHandler(async (req, res) => {
  const requestId = (req.body.requestId || '').trim();
  const phoneNumberInput = (req.body.phoneNumber || '').trim();
  const normalizedPhone = normalizePhoneNumber(phoneNumberInput);
  const verificationCode = (req.body.verificationCode || '').trim();
  const newPassword = req.body.newPassword || '';
  const confirmNewPassword = req.body.confirmNewPassword || '';

  if (!requestId || !phoneNumberInput || !verificationCode || !newPassword || !confirmNewPassword) {
    return renderForgotPassword(res, {
      error: ['All fields are required to reset password.'],
      step: 'verify',
      requestId,
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  if (newPassword.length < 8) {
    return renderForgotPassword(res, {
      error: ['New password must be at least 8 characters.'],
      step: 'verify',
      requestId,
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  if (newPassword !== confirmNewPassword) {
    return renderForgotPassword(res, {
      error: ['New password and confirmation do not match.'],
      step: 'verify',
      requestId,
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  const token = await PasswordResetToken.findById(requestId);
  if (!token || token.usedAt) {
    return renderForgotPassword(res, {
      error: ['Reset request is invalid or already used. Please request another code.'],
      step: 'request',
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  if (token.expiresAt <= new Date()) {
    await PasswordResetToken.findByIdAndDelete(token._id);
    return renderForgotPassword(res, {
      error: ['Reset code has expired. Please request another code.'],
      step: 'request',
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  if (token.attempts >= 5) {
    await PasswordResetToken.findByIdAndDelete(token._id);
    return renderForgotPassword(res, {
      error: ['Too many invalid attempts. Please request another code.'],
      step: 'request',
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  if (!phonesMatch(token.phoneNumber, normalizedPhone)) {
    return renderForgotPassword(res, {
      error: ['Request details do not match. Please request a new code.'],
      step: 'request',
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  const submittedCodeHash = hashResetCode(verificationCode);
  if (submittedCodeHash !== token.codeHash) {
    token.attempts += 1;
    await token.save();
    return renderForgotPassword(res, {
      error: ['Invalid verification code.'],
      step: 'verify',
      requestId: String(token._id),
      oldInput: { phoneNumber: phoneNumberInput },
    });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  if (token.accountType === 'admin') {
    const adminAccount = await Admin.findById(token.accountId, 'username');
    if (!adminAccount) {
      return renderForgotPassword(res, {
        error: ['Account not found. Please contact support.'],
        step: 'request',
        oldInput: { phoneNumber: phoneNumberInput },
      });
    }

    await Admin.findByIdAndUpdate(
      token.accountId,
      { $set: { password: hashedPassword } },
      { runValidators: false }
    );

    token.usedAt = new Date();
    await token.save();

    return establishSessionAndRedirect(req, res, {
      role: 'admin',
      redirectTo: '/dashboard',
      admin: {
        id: adminAccount._id,
        username: adminAccount.username,
      },
      user: null,
    });
  } else {
    const userAccount = await User.findById(token.accountId, 'username');
    if (!userAccount) {
      return renderForgotPassword(res, {
        error: ['Account not found. Please contact support.'],
        step: 'request',
        oldInput: { phoneNumber: phoneNumberInput },
      });
    }

    await User.findByIdAndUpdate(
      token.accountId,
      { $set: { password: hashedPassword } },
      { runValidators: false }
    );

    token.usedAt = new Date();
    await token.save();

    return establishSessionAndRedirect(req, res, {
      role: 'user',
      redirectTo: '/',
      admin: null,
      user: {
        id: userAccount._id,
        username: userAccount.username,
      },
    });
  }
});

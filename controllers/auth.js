const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const Admin = require('../models/admin');
const User = require('../models/users');

function renderSignIn(res, username = '', signInError = '') {
  return res.status(signInError ? 401 : 200).render('signin', {
    title: 'Sign In',
    signInError,
    oldInput: { username },
  });
}

exports.getSignInPage = asyncHandler(async (req, res) => {
  if (req.session?.admin) {
    return res.redirect('/dashboard');
  }

  if (req.session?.user) {
    return res.redirect('/');
  }

  return renderSignIn(res);
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
});

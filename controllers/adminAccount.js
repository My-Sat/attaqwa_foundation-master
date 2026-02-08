// controllers/authController.js
const { validationResult } = require('express-validator'); // Import express-validator
const asyncHandler = require('express-async-handler');
const Admin = require('../models/admin');
const RegistrationFee = require('../models/registrationFee');

// GET:  Admin Sign-Up Page
exports.getAdminSignUp = (req, res) => {
  res.render('signup_admin', {
    title: 'Admin Sign Up',
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

//POST: Admin sign up
exports.postAdminSignUp = [
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).render('signup_admin', {
        errors: errors.array(),
        oldInput: req.body,
      });
    }

    const { firstName, surname, otherNames, phoneNumber, username, password } = req.body;

    // Convert username to lowercase
    const formattedUsername = username.trim().toLowerCase();
    const formattedPhoneNumber = phoneNumber.trim();

    // Check if username is already taken
    const [existingAdminByUsername, existingAdminByPhone] = await Promise.all([
      Admin.findOne({ username: formattedUsername }),
      Admin.findOne({ phoneNumber: formattedPhoneNumber }),
    ]);

    if (existingAdminByUsername || existingAdminByPhone) {
      return res.status(400).render('signup_admin', {
        title: 'Admin Sign Up',
        errors: [
          existingAdminByUsername
            ? { msg: 'Username is already taken' }
            : { msg: 'Phone number is already registered' },
        ],
        oldInput: {
          firstName,
          surname,
          otherNames,
          phoneNumber: formattedPhoneNumber,
          username,
        },
      });
    }

    const admin = new Admin({
      firstName,
      surname,
      otherNames: otherNames || '',
      phoneNumber: formattedPhoneNumber,
      username: formattedUsername,
      password,
    });
    await admin.save();

    res.redirect('/admin_signup_success');
  }),
];

//Success sign up for admin
exports.getAdminSignUpSuccess = (req, res) => {
  res.render('adminSignUpSuccess', {
    title: 'Signup Successful'
  });
};


//GET: Admin Dashs Board
exports.getAdminDashboard = (req, res) => {
    // Check if admin is logged in
    if (!req.session.admin) {
        return res.redirect('/signin');
    }
    res.render('admin_dashboard', { title: 'Admin Dashboard' });
};
    //GET: Delete admin page
exports.getDeleteAdminPage = asyncHandler(async (req, res) => {
  const success = req.flash('success'); // Get success messages
  const error = req.flash('error');    // Get error messages

  const admins = await Admin.find({}, 'username'); // Fetch admins (only usernames)

  res.render('deleteAdmin', {
    title: 'Delete Admin',
    admins,
    success,
    error,
  });
});

// POST: Delete a specific admin
exports.postDeleteAdmin = asyncHandler(async (req, res) => {
  const { adminId } = req.body;

  // Check for valid adminId
  if (!adminId) {
    req.flash('error', 'Invalid admin selected.');
    return res.redirect('/delete_admin');
  }

  // Prevent self-deletion for logged-in admin
  if (req.session.admin && req.session.admin._id === adminId) {
    req.flash('error', 'You cannot delete your own account while logged in.');
    return res.redirect('/delete_admin');
  }

  // Delete the admin
  await Admin.findByIdAndDelete(adminId);

  req.flash('success', 'Admin deleted successfully.');
  res.redirect('/delete_admin');
});

exports.getRegistrationFee = asyncHandler(async (req, res) => {
  const fee = await RegistrationFee.findOne();
  res.render('admin_registration_fee', { fee });
});

exports.postRegistrationFee = asyncHandler(async (req, res) => {
  const { amount } = req.body;
  let fee = await RegistrationFee.findOne();
  if (fee) {
    fee.amount = amount;
    fee.updatedAt = Date.now();
  } else {
    fee = new RegistrationFee({ amount });
  }
  await fee.save();
  req.flash('success', 'Registration fee updated successfully.');
  res.redirect('registration_fee');
});

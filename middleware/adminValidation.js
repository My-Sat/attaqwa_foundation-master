const { check } = require('express-validator');
  
  // Validation Middleware for Admin Sign-Up
  exports.validateAdminSignUp = [
    check('firstName')
      .notEmpty().withMessage('First name is required')
      .isLength({ min: 2, max: 50 }).withMessage('First name must be between 2 and 50 characters')
      .trim(),
    check('surname')
      .notEmpty().withMessage('Surname is required')
      .isLength({ min: 2, max: 50 }).withMessage('Surname must be between 2 and 50 characters')
      .trim(),
    check('otherNames')
      .optional({ checkFalsy: true })
      .isLength({ max: 80 }).withMessage('Other names must not exceed 80 characters')
      .trim(),
    check('phoneNumber')
      .customSanitizer((value) => String(value || '').replace(/[\s()-]/g, ''))
      .notEmpty().withMessage('Phone number is required')
      .matches(/^\+[1-9]\d{7,14}$/).withMessage('Enter a valid phone number with country code (e.g. +233...)')
      .trim(),
    check('username')
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters long')
      .trim(),
    check('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8, max: 64 }).withMessage('Password must be between 8 and 64 characters long'),
    check('confirmPassword')
      .notEmpty().withMessage('Confirm Password is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ];
  

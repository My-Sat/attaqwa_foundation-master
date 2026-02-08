const { check } = require('express-validator');

exports.validateUserSignUp = [
  check('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2-50 characters long'),

  check('surname')
    .trim()
    .notEmpty().withMessage('Surname is required')
    .isLength({ min: 2, max: 50 }).withMessage('Surname must be 2-50 characters long'),

  check('otherNames')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 80 }).withMessage('Other names must not exceed 80 characters'),

  // Validate username (non-empty and length constraints)
  check('username')
    .trim()
    .notEmpty().withMessage('Username is required')
    .isLength({ min: 3, max: 20 }).withMessage('Username must be 3-20 characters long'),

  // Validate phone number (pattern specific for +233 or 0)
  check('phoneNumber')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^(\+233|0)[1-9]{1}[0-9]{8}$/).withMessage('Invalid phone number format'),

  // Validate password
  check('password')
    .trim()
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters long'),

  // Validate confirm password and ensure it matches the password
  check('confirmPassword')
    .trim()
    .notEmpty().withMessage('Password confirmation is required')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

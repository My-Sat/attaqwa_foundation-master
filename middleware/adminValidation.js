const { check } = require('express-validator');
  
  // Validation Middleware for Admin Sign-Up
  exports.validateAdminSignUp = [
    check('username')
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3, max: 20 }).withMessage('Username must be between 3 and 20 characters long')
      .trim(),
    check('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 6, max: 20 }).withMessage('Password must be between 6 and 20 characters long'),
    check('confirmPassword')
      .notEmpty().withMessage('Confirm Password is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Passwords do not match');
        }
        return true;
      }),
  ];
  
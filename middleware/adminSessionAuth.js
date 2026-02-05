// middleware/auth.js
const isAdmin = (req, res, next) => {
  // Check if session exists and user is logged in as an admin
  if (req.session && req.session.isLoggedIn && req.session.admin) {
      return next(); // Proceed to the next middleware or route handler
  }

  // If not authenticated, redirect to the sign-in page
  res.redirect('/signin');
};

  module.exports = isAdmin;
  
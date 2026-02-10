module.exports = function isAnySessionAuthenticated(req, res, next) {
  const isSignedIn = Boolean(
    req.session &&
    req.session.isLoggedIn &&
    (req.session.user || req.session.admin)
  );

  if (isSignedIn) {
    return next();
  }

  if (req.originalUrl && req.originalUrl.startsWith('/api/')) {
    return res.status(401).json({ error: 'You need to sign in to continue.' });
  }

  return res.redirect('/signin');
};

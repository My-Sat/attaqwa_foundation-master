
exports.signOut = (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error(err);
      res.redirect('/');
    });
  };
  
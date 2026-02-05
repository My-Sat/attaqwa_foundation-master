// Controller to render the Donate page
exports.getDonatePage = (req, res) => {
    res.render('donatePage', { title: 'Donate' });
  };
  
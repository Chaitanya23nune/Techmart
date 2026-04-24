function isAuth(req, res, next) {
  if (req.session.user) return next();
  req.session.returnTo = req.originalUrl;
  res.redirect('/auth/login');
}

function isAdmin(req, res, next) {
  if (req.session.isAdmin) return next();
  res.redirect('/auth/admin-login');
}

function isGuest(req, res, next) {
  if (req.session.user) return res.redirect('/');
  next();
}

module.exports = { isAuth, isAdmin, isGuest };

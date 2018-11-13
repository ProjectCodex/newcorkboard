const passport = require('passport');
const router = require('express').Router();

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

router.get('/auth/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
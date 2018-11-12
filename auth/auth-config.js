const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const db = require('../models');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
},
    function (accessToken, refreshToken, profile, cb) {
        db.User.findOrCreate({
            where: {
                id: profile.id
            },
            defaults: {
                firstName: profile.name.givenName,
                lastName:profile.name.familyName,
                email: profile.emails.find(email => email.type === 'account').value
            }
        })
            .spread((user, created) => {
                return cb(null, user);
            })
            .catch(err => cb(err, null))
    }
));

passport.serializeUser(function (user, done) {
    // console.log("serialize: " + JSON.stringify(user))
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    db.User.findById(id).then(function(user) {
        // console.log("deserialize:" + JSON.stringify(user));
        done(null, user);
    })
});

module.exports = passport;
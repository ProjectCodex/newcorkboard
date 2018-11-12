const authRouter = require('./auth-routes');
const cookieSession = require('cookie-session');
const passport = require('./auth-config');
const bodyParser = require("body-parser");


module.exports = function(app) {
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(cookieSession({
        name: process.env.COOKIE_NAME,
        keys: [
            process.env.COOKIE_KEY_1,
            process.env.COOKIE_KEY_2,
            process.env.COOKIE_KEY_3,
        ],
        // Cookie Options
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      }));
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(authRouter);
    app.use(require('./enforce-auth.js'));
}
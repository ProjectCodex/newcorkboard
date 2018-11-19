const db = require('../models');
const asyncErr = require('./asyncErr');

module.exports = asyncErr(async function(req, res, next) {
    const users = await db.User.findAll({
        where: { email: null }
    });
    req.user = users[Math.floor(Math.random() * users.length)]
    next();
});
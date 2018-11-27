const db = require('../models');
const asyncErr = require('./asyncErr');

module.exports = asyncErr(async function(req, res, next) {
    const users = await db.User.findOne({
        where: { id: 1542818266606 }
    });
    // req.user = users[Math.floor(Math.random() * users.length)]
    req.user = users;
    next();
});
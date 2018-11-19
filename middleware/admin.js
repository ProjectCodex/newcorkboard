const db = require('../models');
const asyncErr = require('./asyncErr');

module.exports = asyncErr(async function(req, res, next) {
    const board = await db.Board.findById(req.params.boardId);
    const users = await board.getUsers({ where: { id: req.user.id } })
    const user = users.find(user => user.id === req.user.id);
    console.log(user.BoardUsers.role);
    user.BoardUsers.role === 'admin' ? req.user.admin = true : req.user.admin = false;
    next();
});
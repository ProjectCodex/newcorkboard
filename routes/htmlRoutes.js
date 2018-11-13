const router = require('express').Router();
const db = require("../models/index.js");
const path = require("path");

/*
router.get('/boards/:board', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.board,
        },
        order: [
            [{model: db.Link, as: "links"},'updatedAt', 'DESC'],
            [{model: db.Tag, as: "tags"},'name', 'ASC'],
            [{model: db.Message, as: "messages"},'updatedAt', 'DESC']            
            
        ],
        include: [
            {
                model: db.Link,
                as: "links",
                include: {
                    model: db.Tag,
                    as: 'Tags',
                    attributes: ['id', 'name']
                }
            },
            {
                model: db.Tag,
                as: "tags"
            },
            {
                model: db.Message,
                as: 'messages'
            }
        ]
    }).then(results => res.render('index', {board: results}))
    .catch(err => res.json(err));
});
*/
router.get('/boards/:board', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.board
        }
    }).then(result1 =>{
        db.Link.findAll({
            where: {
                BoardId: req.params.board
            },
            order: [['updatedAt', 'DESC']],
            include: [{model: db.Tag}]
        }).then(result2 =>{
            db.Tag.findAll({
                where: {
                    BoardId: req.params.board
                },
            order: [['name', 'ASC']]                
            }).then(result3 => {
                db.Message.findAll({
                    where: {
                        BoardId: req.params.board
                    },
                    order: [['updatedAt', 'DESC']]               
                }).then(result4 => {
                    let obj = {
                        board: {
                            name: result1.name,
                            id: result1.id,
                            links: result2,
                            tags: result3,
                            messages: result4
                        }
                    }
                    
                    res.render('index', obj);
                }).catch(err=>res.json(err))
            }).catch(err=>res.json(err))
        }).catch(err=>res.json(err))
    }).catch(err=>res.json(err))
});

/*
router.get('/boards/:board/tags/:tagId', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.board
        },
        order: [
            [{model: db.Link, as: "links"},'updatedAt', 'DESC'],
            [{model: db.Tag, as: "tags"},'name', 'ASC'],
            [{model: db.Message, as: "messages"},'updatedAt', 'DESC']            
            
        ],
        include: [
            {
                model: db.Link,
                as: "links",
                include: {
                    model: db.Tag,
                    as: 'Tags',
                    attributes: ['id', 'name'],
                    where: {
                        id: req.params.tagId
                    }
                }
            },
            {
                model: db.Tag,
                as: "tags"
            },
            {
                model: db.Message,
                as: 'messages'
            }
        ]
    }).then(results => res.render('index', {board: results}))
    .catch(err => res.json(err));
});
*/

router.get('/boards/:board/tags/:tagId', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.board
        }
    }).then(result1 =>{
        db.Link.findAll({
            where: {
                BoardId: req.params.board
            },
            order: [['updatedAt', 'DESC']],
            include: [{
                model: db.Tag,
                where: {
                    id: req.params.tagId
                }
            }]
        }).then(result2 =>{
            db.Tag.findAll({
                where: {
                    BoardId: req.params.board
                },
            order: [['name', 'ASC']]                
            }).then(result3 => {
                db.Message.findAll({
                    where: {
                        BoardId: req.params.board
                    },
                    order: [['updatedAt', 'DESC']]               
                }).then(result4 => {
                    let obj = {
                        board: {
                            name: result1.name,
                            id: result1.id,
                            links: result2,
                            tags: result3,
                            messages: result4
                        }
                    }
                    
                    res.render('index', obj);
                }).catch(err=>res.json(err))
            }).catch(err=>res.json(err))
        }).catch(err=>res.json(err))
    }).catch(err=>res.json(err))
});

/*
router.post('/boards/:boardId/tags', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.boardId
        },
        order: [
            [{model: db.Link, as: "links"},'updatedAt', 'DESC'],
            [{model: db.Tag, as: "tags"},'name', 'ASC'],
            [{model: db.Message, as: "messages"},'updatedAt', 'DESC']
        ],
        include: [
            {
                model: db.Link,
                as: "links",
                include: {
                    model: db.Tag,
                    as: 'Tags',
                    attributes: ['id', 'name'],
                    through: {
                        where: {
                            TagId: {
                                [db.Sequelize.Op.in]: req.body.tags
                            }
                        }
                    },
                    required: true
                }
            },
            {
                model: db.Tag,
                as: "tags"
            },
            {
                model: db.Message,
                as: 'messages'
            }
        ]
    }).then(results => {
            res.render('index', {board: results})
    })//res.redirect(`/boards/${req.params.boardId}`))
    .catch(err => res.json(err));
});
*/

router.post('/boards/:boardId/tags', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.boardId
        }
    }).then(result1 =>{
        db.Link.findAll({
            where: {
                BoardId: req.params.boardId
            },
            order: [['updatedAt', 'DESC']],
            include: {
                model: db.Tag,
                as: 'Tags',
                attributes: ['id', 'name'],
                through: {
                    where: {
                        TagId: {
                            [db.Sequelize.Op.in]: req.body.tags
                        }
                    }
                },
                required: true
            }
        }).then(result2 =>{
            db.Tag.findAll({
                where: {
                    BoardId: req.params.boardId
                },
            order: [['name', 'ASC']]                
            }).then(result3 => {
                db.Message.findAll({
                    where: {
                        BoardId: req.params.boardId
                    },
                    order: [['updatedAt', 'DESC']]               
                }).then(result4 => {
                    let obj = {
                        board: {
                            name: result1.name,
                            id: result1.id,
                            links: result2,
                            tags: result3,
                            messages: result4
                        }
                    }
                    
                    res.render('index', obj);
                }).catch(err=>res.json(err))
            }).catch(err=>res.json(err))
        }).catch(err=>res.json(err))
    }).catch(err=>res.json(err))
});

router.get('/boards/:board/*', function(req, res) {
    res.redirect(`/boards/${req.params.board}`);
});


module.exports = router;

const router = require('express').Router();
const db = require("../models/index.js");
const scrape = require('metatag-crawler');
const mail = require('./mailer.js');

router.post('/mail', function(req, res){
    //sendMail(to, subject, bodyText, htmlText)
    mail(req.body.to, req.body.subject, req.body.bodyText, req.body.htmlText);
    res.json("mail sent");
});

//this route returns meta data from a url that's posted
router.post('/scrape', function(req, res) {
    let url = req.body.url;
    scrape(url, function(err, data) {
        if (err) return res.json({error: err});
        let meta;
        //check if there are facebook meta tags
        if(data.og) {
            meta = {
                title: data.og.title,
                description: data.og.description,
                url: data.og.url,
            }
            //ensure there's an image to return
            if(data.og.images[0]) meta.image = data.og.images[0].url
            res.json(meta);
        } else {
            meta = {
                title: data.meta.title,
                description: data.meta.description,
                url: data.meta.canonical,
            }
            if(data.images[0]) meta.image = data.images[0].url
            res.json(meta);
        }
    }); 
});

//get boards associated with your account
router.get('/boardlist', async (req, res) => {
    const list = await req.user.getBoards();
    // const list = await db.Board.findAll({});
    res.json(list);
});

//create a new board
router.post('/boards/new', function(req, res) {
    db.Board.create({
        name: req.body.name
    }).then(board => {
        board.addUser(req.user, { through: { role: 'admin' } });
        res.json(board)
    })
    .catch(err => res.json(err));
});

//delete board
router.delete('/boards/:boardId', async function(req, res) {
    try {
        const board = await db.Board.findById(req.params.boardId);
        const user = await board.getUsers({ where: { id: req.user.id } });
        if (user[0].BoardUsers.role === 'admin') {
            const result = await db.Board.destroy({ where: { id: req.params.boardId } });
            res.json({'message': `Board '${board.name}' Deleted`});
        } else {
            res.json({ 'error': 'You must be an admin to delete a board' });
        }
    } catch(err) {
        res.json(err)
    }
});

//create a new link
router.post('/boards/:boardId/links/new', function(req, res) {
    db.Link.create({
        BoardId: req.params.boardId,
        title: req.body.title,
        description: req.body.description,
        url: req.body.url,
        image_url: req.body.image_url
    }).then(function(results, err) {
        //tags should be an array of id numbers
        //if user sends tags, set those tags on newly created link
        //tags: [1,2]
        if(req.body.tags) {
            results.setTags(req.body.tags)
            .then(result => res.json([results, result]))
            .catch(err => res.json(err));
        } else {
            res.json(results);
        }
    }).catch(err => res.json(err));
});

//edit link info
router.put('/boards/:boardId/links/:linkId', function(req, res) {
    db.Link.update({
        title: req.body.title,
        description: req.body.description,
        url: req.body.url,
        image_url: req.body.image_url
    },
    {
        where: {
            BoardId: req.params.boardId,
            id: req.params.linkId
        }
    }
    ).then(results => {
        //tags should be an array of id numbers
        //if null is passed in, all associations will be removed,
        //therefore all tags are removed
        db.Link.findOne({
            where: {
                id : req.params.linkId
            }
        }).then(result => 
            result.setTags(req.body.tags)
            .then(tagResult => res.json([result, tagResult]))
            .catch(err => res.json(err))
        ).catch(err => res.json(err));
    }).catch(err => res.json(err));
});

//delete a link
router.delete('/boards/:boardId/links/:linkId', function(req, res) {
    db.Link.destroy({
        where: {
            BoardId: req.params.boardId,
            id: req.params.linkId
        }
    }).then(results => res.json(results))
    .catch(err => res.json(err));
});

//get all tags
router.get('/boards/:boardId/tags', function(req, res) {
    db.Tag.findAll({
        where: {
            BoardId: req.params.boardId
        }
    }).then(results => res.json(results))
    .catch(err => res.json(err));
});

//create a tag
router.post('/boards/:boardId/tags/new', function(req, res) {
    db.Tag.create({
        name: req.body.name,
        BoardId: req.params.boardId
    }).then(results => res.json(results))
    .catch(err => res.json(err));
});

//delete a tag
router.delete('/boards/:boardId/tags/:tagId', function(req, res) {
    db.Tag.destroy({
        where: {
            id: req.params.tagId,
            BoardId: req.params.boardId
        }
    }).then(results => res.json(results))
    .catch(err => res.json(err));
});

//update a tag
router.put('/boards/:boardId/tags/:tagId', function(req, res) {
    db.Tag.update(
        {
            name: req.body.name
        },
        {
            where: {
                id: req.params.tagId,
                BoardId: req.params.boardId
            }
        }
    ).then(results => res.json(results))
    .catch(err => res.json(err));
});

//get all messages
router.get('/boards/:boardId/msgs', function(req, res){
    db.Message.findAll({
        where: {
            BoardId: req.params.boardId
        }
    }).then(results => res.json(results))
    .catch(err => res.json(err));
});

//add a message
router.post('/boards/:boardId/msgs/new', function(req, res) {
    db.Message.create({
        msg: req.body.msg,
        author: req.body.author,
        BoardId: req.params.boardId
    }).then(results => res.json(results))
    .catch(err => res.json(err));
});

//edit a message
router.put('/boards/:boardId/msgs/:msgId', function(req, res) {
    db.Message.update({
        msg: req.body.msg,
        author: req.body.author,
    },{
        where: {
            BoardId: req.params.boardId,
            id: req.params.msgId
        }
    }).then(results => res.json(results))
    .catch(err => res.json(err));
});

//delete a message
router.delete('/boards/:boardId/msgs/:msgId', function(req, res) {
    db.Message.destroy({
        where: {
            id: req.params.msgId,
            BoardId: req.params.boardId
        }
    }).then(results => res.json(results))
    .catch(err => res.json(err));
});
/*
router.get('/boards/:boardId', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.boardId
        },
        order: [
            [{model: db.Link, as: "links"},'updatedAt', 'DESC'],
            [{model: db.Tag, as: "tags"},'updatedAt', 'DESC'],
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
    }).then(results => res.json({board: results}))
    .catch(err => res.json(err));
});

router.get('/boards/:boardId/tags/:tagId', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.boardId
        },
        order: [
            [{model: db.Link, as: "links"},'updatedAt', 'DESC'],
            [{model: db.Tag, as: "tags"},'updatedAt', 'DESC'],
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
    }).then(results => res.json({board: results}))
    .catch(err => res.json(err));
});


router.post('/boards/:boardId/tags', function(req, res) {
    db.Board.findOne({
        where: {
            id: req.params.boardId
        },
        order: [
            [{model: db.Link, as: "links"},'updatedAt', 'DESC'],
            [{model: db.Tag, as: "tags"},'updatedAt', 'DESC'],
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
    }).then(results => res.json(results))//res.redirect(`/boards/${req.params.boardId}`))
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
                    res.json(obj);                    
                }).catch(err=>res.json(err))
            }).catch(err=>res.json(err))
        }).catch(err=>res.json(err))
    }).catch(err=>res.json(err))
});

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
                    res.json(obj);                    
                }).catch(err=>res.json(err))
            }).catch(err=>res.json(err))
        }).catch(err=>res.json(err))
    }).catch(err=>res.json(err))
});

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
                    
                    res.json(obj);
                }).catch(err=>res.json(err))
            }).catch(err=>res.json(err))
        }).catch(err=>res.json(err))
    }).catch(err=>res.json(err))
});

module.exports = router;
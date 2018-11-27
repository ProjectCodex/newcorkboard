const router = require('express').Router();
const db = require("../models/index.js");
const scrape = require('metatag-crawler');
const mail = require('./mailer.js');
const asyncErr = require('../middleware/asyncErr');
const adminCheck = require('../middleware/admin');
const dummyUser = require('../middleware/dummyUser');

router.post('/mail', function(req, res){
    //sendMail(to, subject, bodyText, htmlText)
    mail(req.body.to, req.body.subject, req.body.bodyText, req.body.htmlText);
    res.status(200).json("mail sent");
});

//this route returns meta data from a url that's posted
router.post('/scrape', function(req, res) {
    let url = req.body.url;
    scrape(url, function(err, data) {
        if (err) throw err;
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
            res.status(200).json(meta);
        } else {
            meta = {
                title: data.meta.title,
                description: data.meta.description,
                url: data.meta.canonical,
            }
            if(data.images[0]) meta.image = data.images[0].url
            res.status(200).json(meta);
        }
    });
});

//dev route for adding fake users
router.get('/:boardId/users/dummy', asyncErr(async (req, res) => {
    const board = await db.Board.findById(req.params.boardId);
    const user = await db.User.create({
        id: Date.now()
    })
    const added = await board.addUser(user, { through: { role: 'user' } });
    res.status(200).json({user, added});
}));

//get users with boards
router.get('/users', asyncErr(async (req, res) =>{
    const users = await db.User.findAll({
        include: { model: db.Board }
    });
    res.status(200).json({users});
}));

//get boards associated with your account
router.get('/boards/me', asyncErr(async (req, res) => {
    const list = await req.user.getBoards();
    // const list = await db.Board.findAll({});
    res.status(200).json({list});
}));

// get all boards
router.get('/boards', asyncErr(async (req, res) => {
    const list = await db.Board.findAll({
        include: { model: db.User }
    });
    res.status(200).json({list});
}));

// get users associated with a board
router.get('/boards/:boardId/users', asyncErr(async (req, res) => {
    const board = await db.Board.findOne({ where: { id: req.params.boardId } });
    const users = await board.getUsers();
    res.status(200).json({users});
}));

router.get('/boards/:boardId/join', adminCheck, asyncErr(async (req, res) => {
    if (req.user && !req.user.admin) {
        const board = await db.Board.findById(req.params.boardId);
        const user = await board.addUser(req.user, { through: { role: 'user' } });
        res.status(200).json({user});
    } else {
        throw new Error('You are already an admin of this board');
    }
}));

//create a new board
router.post('/boards/new', asyncErr(async function(req, res) {
    const board = await db.Board.create({ name: req.body.name });
    const users = await board.addUser(req.user, { through: { role: 'admin' } });
    const user = users[0][0];
    console.log(user);
    res.status(200).json({board, user});
}));

//delete board
router.delete('/boards/:boardId', adminCheck, asyncErr( async function(req, res) {
    console.log("you are an admin: ", req.user.admin);
    if (req.user.admin) {
        await db.Board.destroy({ where: { id: req.params.boardId } });
        res.status(200).json({'message': `Board Deleted`});
    } else {
        res.status(401).json({ 'error': 'You must be an admin to delete a board' });
    }
}));

//create a new link
router.post('/boards/:boardId/links/new', dummyUser, asyncErr(async function(req, res) {
    const link = await db.Link.create({
        BoardId: req.params.boardId,
        title: req.body.title,
        description: req.body.description,
        url: req.body.url,
        image_url: req.body.image_url,
        UserId: req.user.id
    })
    //tags should be an array of id numbers
    //if user sends tags, set those tags on newly created link
    //tags: [1,2]
    if(req.body.tags) {
        const tags = await link.setTags(req.body.tags)
        res.status(200).json({ link, tags });
    } else {
        res.status(200).json({ link });
    }

}));

//edit link info
router.put('/boards/:boardId/links/:linkId', adminCheck, asyncErr(async function(req, res) {
    // find link
    const link = await db.Link.findOne({ where: { id : req.params.linkId } });
    // ensure sender is link owner or an admin

    if (link.UserId === req.user.id || req.user.admin) {
        const result = await db.Link.update({
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
        })
        //tags should be an array of id numbers
        //if null is passed in, all associations will be removed,
        //therefore all tags are removed
        if (req.body.tags) {
            const tagResult = await link.setTags(req.body.tags)
            res.status(200).json({link, result, tagResult})
        } else {
            res.status(200).json({link, result});
        }
    } else {
        throw new Error("Must be admin or link owner to edit this link");
    }
}));

//delete a link
router.delete('/boards/:boardId/links/:linkId', adminCheck, asyncErr(async function(req, res) {
    // find link
    const link = await db.Link.findOne({ where: { id : req.params.linkId } });
    // ensure sender is link owner or an admin

    if (link.UserId === req.user.id || req.user.admin) {
        const result = await db.Link.destroy({
            where: {
                BoardId: req.params.boardId,
                id: req.params.linkId
            }
        });
        res.status(200).json({result});
    } else {
        throw new Error("Must be admin or link owner to delete this link");
    }
}));

//get all tags
router.get('/boards/:boardId/tags', asyncErr(async function(req, res) {
    const result = await db.Tag.findAll({ where: { BoardId: req.params.boardId } });
    res.status(200).json({result});
}));

//create a tag
router.post('/boards/:boardId/tags/new', asyncErr(async function(req, res) {
    const result = await db.Tag.create({
        name: req.body.name,
        BoardId: req.params.boardId,
        UserId: req.user.id
    });
    res.status(200).json({result});
}));

//delete a tag
router.delete('/boards/:boardId/tags/:tagId', adminCheck, asyncErr(async function(req, res) {
    // find tag
    const tag = await db.Tag.findOne({ where: { id : req.params.tagId } });
    // ensure sender is tag owner or an admin
    if (tag.UserId === req.user.id || req.user.admin) {
        const result = await db.Tag.destroy({
            where: {
                id: req.params.tagId,
                BoardId: req.params.boardId
            }
        })
        res.status(200).json({result});
    } else {
        throw new Error('Must be tag owner or admin to delete this tag');
    }
}));

//update a tag
router.put('/boards/:boardId/tags/:tagId', adminCheck, asyncErr(async function(req, res) {
    // find tag
    const tag = await db.Tag.findOne({ where: { id : req.params.tagId } });
    // ensure sender is tag owner or an admin
    if (tag.UserId === req.user.id || req.user.admin) {
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
        )
        res.status(200).json(result);
    } else {
        throw new Error('Must be tag owner or admin to edit this tag');
    }
}));

//get all messages
router.get('/boards/:boardId/msgs', asyncErr(async function(req, res){
    const results = await db.Message.findAll({ where: { BoardId: req.params.boardId } });
    res.status(200).json(results);
}));

//add a message
router.post('/boards/:boardId/msgs/new', asyncErr(async function(req, res) {
    const result = await db.Message.create({
        msg: req.body.msg,
        BoardId: req.params.boardId,
        UserId: req.user.id
    });
    res.status(200).json(result);
}));

//edit a message
router.put('/boards/:boardId/msgs/:msgId', asyncErr(async function(req, res) {
    // find msg
    const msg = await db.Message.findOne({ where: { id : req.params.msgId } });
    // ensure sender is msg owner
    if (msg.UserId === req.user.id) {
        db.Message.update({
            msg: req.body.msg
        },{
            where: {
                BoardId: req.params.boardId,
                id: req.params.msgId
            }
        })
        res.status(200).json(result);
    } else {
        throw new Error('must be owner of this message to edit')
    }
}));

//delete a message
router.delete('/boards/:boardId/msgs/:msgId', adminCheck, asyncErr(async function(req, res) {
    // find msg
    const msg = await db.Message.findOne({ where: { id : req.params.msgId } });
    // ensure sender is tag owner or an admin
    if (msg.UserId === req.user.id || req.user.admin) {
        const result = await db.Message.destroy({
            where: {
                id: req.params.msgId,
                BoardId: req.params.boardId
            }
        })
        res.status(200).json(result);
    } else {
        throw new Error('must be owner of message or admin to delete');
    }
}));
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

// get all board items
router.get('/boards/:board', asyncErr(async function(req, res) {
    const boardProm = db.Board.findOne({
        where: {
            id: req.params.board
        }
    });
    const linkProm = db.Link.findAll({
        where: {
            BoardId: req.params.board
        },
        order: [['updatedAt', 'DESC']],
        include: [{model: db.Tag}]
    });
    const tagProm = db.Tag.findAll({
        where: {
            BoardId: req.params.board
        },
        order: [['name', 'ASC']]
    });
    const msgProm = db.Message.findAll({
        where: {
            BoardId: req.params.board
        },
        order: [['updatedAt', 'DESC']]
    });
    const [board, links, tags, msgs] = await Promise.all([boardProm, linkProm, tagProm, msgProm]);
    res.status(200).json({ board, links, tags, msgs });
}));

// get all board items, but only links associated with one tag
router.get('/boards/:board/tags/:tagId', asyncErr(async function(req, res) {
    const boardProm = db.Board.findOne({
        where: {
            id: req.params.board
        }
    });
    const linkProm = db.Link.findAll({
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
    });
    const tagProm = db.Tag.findAll({
        where: {
            BoardId: req.params.board
        },
    order: [['name', 'ASC']]
    });
    const msgProm = db.Message.findAll({
        where: {
            BoardId: req.params.board
        },
        order: [['updatedAt', 'DESC']]
    });
    const [board, links, tags, msgs] = await Promise.all([boardProm, linkProm, tagProm, msgProm]);
    res.status(200).json({ board, links, tags, msgs });
}));

// get all board items, but only links associated with mulitple tags
router.post('/boards/:boardId/tags', function(req, res) {
    const boardProm = db.Board.findOne({
        where: {
            id: req.params.boardId
        }
    })
    const linkProm = db.Link.findAll({
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
    });
    const tagProm = db.Tag.findAll({
        where: {
            BoardId: req.params.boardId
        },
    order: [['name', 'ASC']]
    });
    const msgProm = db.Message.findAll({
        where: {
            BoardId: req.params.boardId
        },
        order: [['updatedAt', 'DESC']]
    });
    const [board, links, tags, msgs] = await Promise.all([boardProm, linkProm, tagProm, msgProm]);
    res.status(200).json({ board, links, tags, msgs });
});

module.exports = router;
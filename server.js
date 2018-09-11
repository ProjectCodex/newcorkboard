const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 3307;
const db = require("./models/index.js");
const path = require("path");
const apiRouter = require("./routes/apiRoutes.js");
const htmlRouter = require('./routes/htmlRoutes.js');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(express.static('public/'));
app.use('/api', apiRouter);
app.use('/', htmlRouter);

//handelbars
const exphbs = require('express-handlebars');
app.engine("handlebars", exphbs({
    defaultLayout: "main"
}));
app.set("view engine", "handlebars");


db.sequelize.sync({}).then(
    app.listen(PORT, function () {
        console.log("listening on http://localhost:" + PORT);
    })
);
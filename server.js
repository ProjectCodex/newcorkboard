require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const db = require("./models");
const path = require("path");

// non-authenticated routes and files can be added here
app.use(express.static('client/build'));

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

// configure express and require authentication
require('./auth/express-config')(app);

//authenticated routes and files go here
app.use('/api', require("./routes/apiRoutes.js"));

db.sequelize.sync({}).then(
    app.listen(PORT, function () {
        console.log("listening on http://localhost:" + PORT);
    })
);
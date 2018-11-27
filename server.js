require('dotenv').config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3001;
const db = require("./models");
const path = require("path");
const enforceAuth = require('./auth/enforce-auth.js');

// configure express
require('./middleware/express-config')(app);

// make sure static files are available for react
app.use(express.static('client/build'));

// serve api routes but require authentication
app.use('/api', enforceAuth, require("./routes/apiRoutes.js"));

//dont enforce auth
// app.use('/api', require("./routes/apiRoutes.js"));

app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

//implement error handler that will respond with JSON and a 500 status code
app.use(require('./middleware/errorHandler'));

//changing force to true will clear the database
db.sequelize.sync({force: false}).then(
    app.listen(PORT, function () {
        console.log("listening on http://localhost:" + PORT);
    })
);
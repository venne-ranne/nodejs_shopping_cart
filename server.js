// imports
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
//var expressLayouts = require('express-ejs-layouts');

// build the connection pool to manage
var pg = require('./config/database');

//manage https secure connection
var https = require("https");
var fs = require("fs");

// Include route modules
var users = require('./routes/users');
var collections = require('./routes/collections');
var carts = require('./routes/carts');

var cert = fs.readFileSync("cert.pem");
var key = fs.readFileSync("key.pem");

var obj = {
    key:key,
    cert:cert
};

var port = process.env.PORT || 8080; ;


// start express application
var app = express();

// static files such as css, js, resource files in views folder
app.use(express.static('./views'));

/* Use Included Routes */

// interacting with collections resource
app.use('/', collections);
// user registration/login
app.use('/', users);
// shopping cart functionality
app.use('/carts', carts);

app.use(session({
    secret: 'iloveblackrabbitproject',
    resave: false,
    saveUninitialized: true})); // session secret

// // set up template engine
// app.set('view engine', 'ejs');
// app.use(expressLayouts);
// app.set('layout', 'layouts/layout');

//https used for secure communication however only works local wont work when using heroku

// https.createServer(obj,app).listen(port, function() {
//     console.log("Server running on port : " + port);
// });

//start server listening
app.listen(port, function() {
     console.log("Server running on port : " + port);
 });

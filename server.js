// imports
var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var fs = require('fs');
var session = require('express-session');

//var cors = require('cors');



// server parameters
//var connectionString = process.env.DATABASE_URL;

var connectionString = "postgres://localhost:5432/conor";
//var connectionString = "postgres://localhost:5432/yappvivi_jdbc";
var port = process.env.PORT || 8080; ;


var expressLayouts = require('express-ejs-layouts');

// start express application
var app = express();


// static files such as css, js, resource files in views folder
app.use(express.static('./views'));

// include routes

// user registration/login
app.use(require('./routes/users'));
// interacting with collections resource
app.use(require('./routes/collections'));
// shopping cart functionality
app.use(require('.routes/carts'));


//start server listening
app.listen(port, function() {
    console.log("Server running on port : " + port);
});

// setup body parser to use JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'iloveblackrabbitproject',
    resave: false,
    saveUninitialized: true})); // session secret

// set up template engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// root page
app.get('/', function(req, res) {
    if (req.session.totalcart == undefined) req.session.totalcart = 0;
    res.render('index.ejs', { user: req.session.user, totalcart: req.session.totalcart});
});

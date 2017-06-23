// imports
var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var fs = require('fs');
var session = require('express-session');
var expressLayouts = require('express-ejs-layouts');

// import routes
var carts = require('./routes/carts');
var users = require('./routes/users');
var collections = require('./routes/collections');

// server parameters
//var connectionString = process.env.DATABASE_URL;
//var connectionString = "postgres://localhost:5432/conor";
//var connectionString = "postgres://localhost:5432/yappvivi_jdbc";
var port = process.env.PORT || 8080; ;


// start express application
var app = express();


// static files such as css, js, resource files in views folder
app.use(express.static('./views'));

// use included routes
// user registration/login
app.use('/', users);
// interacting with collections resource
app.use('/collections', collections);
// shopping cart functionality
app.use('/carts', carts);


//start server listening
app.listen(port, function() {
    console.log("Server running on port : " + port);
});

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

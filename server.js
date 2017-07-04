// Imports
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressLayouts = require('express-ejs-layouts');

// Build the connection pool to manage
var pg = require('./config/database');

// Manage https secure connection
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
// Time to cache static content
var maxCacheTime = 1000 * 60 * 2;

// Start express application
var app = express();

// Static files such as css, js, resource files in views folder
// set length of time to cache
app.use(express.static('./views', {
    maxAge: maxCacheTime
}));

/* Use Included Routes */

// user registration/login
app.use('/', users);
// interacting with collections resource
app.use('/collections', collections);
// shopping cart functionality
app.use('/carts', carts);

// set up template engine
app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layouts/layout');

// Force http to https
app.use(function (request, response, next) {
    if (!request.headers.host.startsWith("localhost") && request.headers['x-forwarded-proto'] !== 'https') {
        var httpsUrl = ['https://guarded-falls-74429.herokuapp.com/', request.url].join('');
        return response.redirect(httpsUrl);
    }
    return next();
});

//https used for secure communication however only works local wont work when using heroku
/*
 https.createServer(obj,app).listen(port, function() {
     console.log("Server running on port : " + port);
 });
*/

// root page
app.get('/', function(req, res) {
    //if (req.session.totalcart == undefined) req.session.totalcart = 0;
    res.render('index.ejs', {totalcart: 0});
});

// start server listening
app.listen(port, function() {
     console.log("Server running on port : " + port);

});

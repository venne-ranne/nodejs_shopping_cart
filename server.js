// imports
var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var https = require('https');
var fs = require('fs');
var request;

// server parameters
var connectionString = process.env.DATABASE_URL;
var port = process.env.PORT;
var keyPath = __dirname + '/key.pem';
var certPath = __dirname + '/cert.pem';
var googleClientID = '529872489200-j1bfbmtusgon8q8hat64pguokitqh6j6.apps.googleusercontent.com';
var googleClientSecret = 'VTUS2aQdug6oKtDzSt4m6g_3'



// start express application
var app = express();

// start server listening
app.listen(port, function() {
    console.log("Server running on port : " + port);
});
// https.createServer({
//     key: fs.readFileSync(keyPath),
//     cert: fs.readFileSync(certPath),
//     passphrase: 'aaaa'
//     }, app).listen(port, function() {
//         console.log('Server listening on port ' + port);
// });

// connect to postgresql database
var client = new pg.Client(connectionString);
client.connect();

// setup body parser to use JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// root page
app.get('/', function(req, res) {
    //res.writeHead(200);
    res.sendFile(__dirname + '/views/index.html');
});

// shopping cart page
app.get('/cart', function(req, res) {

});

// retrive all items in stock
app.get('/collections', function(req, res) {
    // select * from products
});

// retrive the list of all items in category 'art'
app.get('/collections/art', function(req, res) {
    // select from products where category = 'art'
});

// retrive the list of all items in category 'cushion'
app.get('/collections/cushion', function(req, res) {
    // select from products where category = 'cushion'
});

// retrive the list of all items in category 'mug'
app.get('/collections/mug', function(req, res) {
    // select from products where category = 'mug'
});

// retrive the list of all items in category 'vase'
app.get('/collections/vase', function(req, res) {
    // select from products where category = 'vase'
});

// login request
app.get('/login', function(req, res) {

});

// register request
app.get('/register', function(req, res) {

});

// resource locations
var css = '/css/stylesheet.css';
var cart = '/shopping_cart.js';
var logo = '/resources/logo.png';
var mPicsTtf = '/views/fonts/modernpics-webfont.ttf';
var mPicsWoff = '/views/fonts/modernpics-webfont.woff';

// resource requests
app.get(css, function(req, res) { res.sendFile(__dirname + '/views' + css) });
app.get(cart, function(req, res) { res.sendFile(__dirname + '/views' + cart) });
app.get(logo, function(req, res) { res.sendFile(__dirname + logo) });
app.get(mPicsTtf, function(req, res) { res.sendFile(__dirname + mPicsTtf) });
app.get(mPicsWoff, function(req, res) { res.sendFile(__dirname + mPicsWoff) });

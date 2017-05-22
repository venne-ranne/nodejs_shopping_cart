// imports
var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');

// server parameters
var connectionString = process.env.DATABASE_URL;
var port = process.env.PORT;

// start express application
var app = express();

// connect to postgresql database
var client = new pg.Client(connectionString);
client.connect();

// setup body parser to use JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// root page
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

// shopping cart page
app.get('/cart', function(req, res) {

});

// retrive all items in stock
app.get('/collections', function(req, res) {

});

// retrive the list of all items in category1
app.get('/collections/category1', function(req, res) {

});

// retrive the list of all items in category2
app.get('/collections/category2', function(req, res) {

});

// retrive the list of all items in category3
app.get('/collections/category3', function(req, res) {

});

// login request
app.get('/login', function(req, res) {

});

// register request
app.get('/register', function(req, res) {

});

// start server listening
app.listen(port, function(error) {
    console.log('Listening on port ' + port);
});

// resource requests

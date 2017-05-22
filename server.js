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
app.get('/cart') {

});

// retrive all items in stock
app.get('/collections') {

});

// retrive the list of all items in category1
app.get('/collections/category1') {

});

// retrive the list of all items in category2
app.get('/collections/category2') {

});

// retrive the list of all items in category3
app.get('/collections/category3') {

});

// login request
app.get('/login') {

});

// register request
app.get('/register') {

});

// start server listening
app.listen(port, function(error) {
    console.log('Listening on port ' + port);
});

// resource requests

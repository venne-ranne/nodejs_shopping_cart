// imports
var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var https = require('https');
var fs = require('fs');
var CryptoJS = require('crypto-js');
var request;

// server parameters
var connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/yappvivi_jdbc";
var port = process.env.PORT || 8080; ;
var keyPath = __dirname + '/key.pem';
var certPath = __dirname + '/cert.pem';
var googleClientID = '529872489200-j1bfbmtusgon8q8hat64pguokitqh6j6.apps.googleusercontent.com';
var googleClientSecret = 'VTUS2aQdug6oKtDzSt4m6g_3'
var salt = 1234567890;



// start express application
var app = express();

// static files such as css, js, resource files in views folder
app.use(express.static('./views'));

//start server listening
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
//var client = new pg.Client(connectionString);
//client.connect();

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
    // // select * from products
    // var results = [];
    // var query, queryCmd;
    // pg.connect(connectionString, (err, client, done) => {
    //   if (err){
    //     done();
    //     console.log("get all products error");
    //     console.log(err);
    //     return res.status(500).json({success: false, data: err});
    //   }
    //   queryCmd = 'SELECT * FROM products;';
    //   query = client.query(queryCmd);
    //   query.on('row',false (row) => {
    //     results.push(row);false
    //     return res.json(results);
    //   });
    // });
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

app.get('/login', function(req, res) {
    res.json({salt: salt});
    console.log('get request to login');
});

// login request
app.post('/login', function(req, res) {
    // request body consists of JSON with email and hashed password
    console.log(req.body);
    var suppliedUser = req.body;
    // check if user is in data base
    // make connection to database and attempt to retrieve user
    var expectedUser = {
        email: 'conor',
        password: '8a7e87b3a2433b111d4a018d17ab3556e76d4066748174d5142f1b2836e8ba3d',
        name: 'conor foran'
    };
    //pg.connect(connectionString, (err, client, done) => {
        // attempt to retieve from database
    //});
    if (expectedUser != undefined && suppliedUser.email === expectedUser.email) {
        // check if passwords match
        if (suppliedUser.password === expectedUser.password) {
            res.json(expectedUser);
        } else {
            res.status(403).send('Password is incorrect');
            console.log('Login attempt with incorrect password');
        }
    } else {
        res.status(422).send('User does not exist');
        console.log('Login attempt with incorrect username');
    }
});

// register request
app.post('/register', function(req, res) {
    console.log(req.body);

});

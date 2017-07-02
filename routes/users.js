/*jslint node: true, unparam: true*/
/*global __dirname: false */
"use strict";
var express = require('express');
//handle client pool
var pool = require('../config/database');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var hash = require('crypto').createHash('sha256');

// OAuth credentials
var oauth2Client = new OAuth2(
    '529872489200-7p4rr06g8ari4q01ti122kfbrntmnkp2.apps.googleusercontent.com',
    'sBBXD4cCXY4C3hgLUd-OmFhu',
    'https://guarded-falls-74429.herokuapp.com'
    //'http://localhost:8080'
);

// Level of access being requested
var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/plus.me']
});

// setup body parser to use JSON
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session({
    secret: 'iloveblackrabbitproject',
    resave: false,
    saveUninitialized: true}
)); // session secret

// Send a salt to client for them to append to passwords
var salt = 1234567890;
router.get('/login', function(req, res) {
    res.json({salt: salt});
    console.log('get request to login');
});


// request to authenticate using google
// user has recieved a access code which is to be exchanged for tokens
router.post('/login/google', function(req, res) {
    var code = req.body.code;
    console.log('Code : ' + code);
    oauth2Client.getToken(code, function(error, tokens) {
        if (!error) {
            oauth2Client.setCredentials(tokens);
            console.log('Authentication Success : ' + tokens);
            // use tokens to retrieve users email and name
            google.plus('v1').people.get({
                userId: 'me',
                auth: oauth2Client
            }, function (error, gRes) {
                if (error) console.log('Error : ' + error);
                else {
                    var user = {
                        email: gRes.emails[0].value,
                        name: gRes.name.givenName
                    }
                    console.log(JSON.stringify(user));
                    // check if user exists in db
                    pool.query(
                        'select name, email, role from users where email = $1',
                        [user.email],
                        function(err, result) {
                            if (err) res.status(500).send('Database query error');
                            if (result.rows.length == 1) {
                                // user exists trust google and log them in
                                user.role = result.rows[0].role;
                                req.session.user = user;
                                res.status(200).send({user: user});
                            } else {
                                // new user make up password
                                hash.update(user.name + user.email + salt);
                                user.password = hash.digest('hex');
                                addNewUser(user);
                                updateCarts(user, req);
                                req.session.user = user;  // save the logged in user in the session
                                res.status(201).send({user: user});
                            }
                    });
                }
            });
        } else {
            console.log('Error : ' + error);
            res.status(403).send(error);
        }
    });

});

// login request
router.post('/login', function(req, res) {
    // request body consists of JSON with email and hashed password
    console.log(req.body);
    var suppliedUser = req.body;
    // make query to database and attempt to retrieve user
    pool.query(
        'select email, password, name, role from users where email = $1',
        [suppliedUser.email],
        function(err, result) {
            if (err) {
                console.log(err.message);
                return res.status(500);
            } else {
                console.log(result.rows);
                if (result.rows.length == 0) {  // no user found
                    res.status(422).send('User does not exist');
                    console.log('Login attempt with incorrect username');
                } else {  // user exists
                    var expectedUser = result.rows[0];
                    var role = expectedUser.role;
                    console.log(expectedUser);
                    if (suppliedUser.password === expectedUser.password) {   // check passwords
                        req.session.user = expectedUser;                     // save the logged in user in the session
                        if (role == 'user') updateCarts(suppliedUser, req);  // successful login, update carts
                        res.send({user: expectedUser});
                    } else {
                        res.status(403).send('Password is incorrect');
                        console.log('Login attempt with incorrect password');
                    }
                }
            }
    });
});

router.get('/admin', function(req, res) {
    if (req.session.user == undefined || req.session.user.role != 'admin'){
        res.redirect('/');
    } else {
        res.render('dashboard.ejs', { layout: 'layouts/dashboard-layout', user: req.session.user});
    }
});

// register request
router.post('/register', function(req, res) {
    // request body is JSON with email, password and name
    console.log(req.body);
    var newUser = req.body;
    // perform a db lookup on user - if results user exist
    pool.query(
        'select email, password, name from users where email = $1',
        [newUser.email],
        function(error, result) {
            if (result.rows.length > 0) { // username already exists
                res.status(409).send('Username already exists');
            } else {
                addNewUser(newUser);
                updateCarts(newUser, req);
                req.session.user = newUser;  // save the logged in user in the session
                res.status(201).send({user: newUser});
            }
    });
});

router.get('/logout', function(req, res) {
    req.session.user = undefined;
    res.status(200).send({user: undefined});
});

// This function assumes a check has been done if a user exists
// Sets role to user
function addNewUser(user) {
    pool.query(
        'insert into users values($1, $2, $3, $4)',
        [user.email, user.password, user.name, 'user']
    );

}

function updateCarts(user, req) {
    if (req.session.cartid == undefined) return;  // means the user haven't add anything to the cart yet
    console.log('Updating user ...');
    pool.connect(function(err, client, done) {
        var query = client.query(
            'update carts set email = $1 where cartid = $2',
            [user.email, req.session.cartid]
        );
        query.on('end', function(result) {
            console.log('Updating user done.');
            client.end();
        });
    });
}
module.exports = router;

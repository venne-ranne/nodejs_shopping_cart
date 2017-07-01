/*jslint node: true, unparam: true*/
/*global __dirname: false */
"use strict";
var express = require('express');
//handle client pool
var pool = require('../config/database');

var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
// var passport = require('passport');
// var GoogleStrategy = require('passport-google-oauth20').Strategy;

var https = require('https');

var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
    '529872489200-7p4rr06g8ari4q01ti122kfbrntmnkp2.apps.googleusercontent.com',
    'sBBXD4cCXY4C3hgLUd-OmFhu',
    'https://guarded-falls-74429.herokuapp.com'
    //'http://localhost:8080'
);

var scopes = [
    'https://www.googleapis.com/auth/plus.me',
    'https://www.googleapis.com/auth/calendar'
];

var url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
});

// parameters
var salt = 1234567890;
// var googleClientID = '529872489200-j1bfbmtusgon8q8hat64pguokitqh6j6.apps.googleusercontent.com';
// var googleClientSecret = 'VTUS2aQdug6oKtDzSt4m6g_3'

// passport.use(new GoogleStrategy({
//     clientID: googleClientID,
//     clientSecret: googleClientSecret,
//     callbackURL: 'https://guarded-falls-74429.herokuapp.com/',
//     passReqToCallback: true},
//     function(token, tokenSecret, profile, done) {
//         User.findOrCreate({ googleId: profile.id }, function(err, user) {
//             return done(err, user);
//         });
//     }
// ));

// setup body parser to use JSON
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session({
    secret: 'iloveblackrabbitproject',
    resave: false,
    saveUninitialized: true}
)); // session secret


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
                    pool.connect(function(error, client, done) {
                        if (error) res.status(500).send('Database connection error');
                        client.query(
                            'select name, email, role from users where email = $1',
                            [user.email],
                            function(err, result) {
                                if (err) res.status(500).send('Database query error');

                                if (result.rows.length == 1) { // user exists
                                    user.role = result.rows[0].role;
                                    req.session.user = user;
                                    res.status(200).send({user: user});
                                } else { // new user
                                    client.query(
                                        'insert into users values($1, $2, $3)',
                                        [user.email, 'password', user.name],
                                        function(err, result) {
                                            if (err) res.status(500).send('Database query error');
                                            done(err);
                                            updateCarts(user, req);
                                            req.session.user = user;  // save the logged in user in the session
                                            res.status(201).send({user: user});
                                        }
                                    )
                                }
                        });
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
    pool.connect(function (err, client, done) {
        if (err) res.status(500).json({success: false, data: err});
        client.query('select email, password, name from users where email = $1',
            [newUser.email],
            function(selectError, result) {
                if (result.rowCount > 0) { // username already exists
                    client.end();
                    res.status(409).send('Username already exists');
                } else {
                    client.query('insert into users values($1, $2, $3)',
                    [newUser.email, newUser.password, newUser.name],
                    function(insertError, result) {
                        done(err);
                        updateCarts(newUser, req);
                        req.session.user = newUser;  // save the logged in user in the session
                        res.status(201).send({user: newUser});
                    });
                }
        });
    });
});

router.get('/logout', function(req, res) {
    req.session.user = undefined;
    res.status(200).send({user: undefined});
});

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

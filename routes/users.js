/*jslint node: true, unparam: true*/
/*global __dirname: false */
"use strict";
var express = require('express');
var pg = require('pg');
var router = express.Router();
var session = require('express-session');
var bodyParser = require('body-parser');
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
var connectionString = process.env.DATABASE_URL;
// parameters
var salt = 1234567890;
var googleClientID = '529872489200-j1bfbmtusgon8q8hat64pguokitqh6j6.apps.googleusercontent.com';
var googleClientSecret = 'VTUS2aQdug6oKtDzSt4m6g_3'

passport.use(new GoogleStrategy({
    clientID: googleClientID,
    clientSecret: googleClientSecret,
    callbackURL: 'https://guarded-falls-74429.herokuapp.com/',
    passReqToCallback: true
    },
    function(token, tokenSecret, profile, done) {
        User.findOrCreate({ googleId: profile.id }, function(err, user) {
            return done(err, user);
        });
    }
));

// setup body parser to use JSON
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session({
    secret: 'iloveblackrabbitproject',
    resave: false,
    saveUninitialized: true})); // session secret


router.get('/login', function(req, res) {
    res.json({salt: salt});
    console.log('get request to login');
});

// request to authenticate using google

//app.get('/login/google', passport.authenticate('google'));

router.get('/login/google',

    passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/userinfo.email']
    }
));

router.get('/login/google/callback',
    passport.authenticate('google', {
        successRedirect: '/',
        failureRedirect: '/login'
}));


// login request
router.post('/login', function(req, res) {
    // request body consists of JSON with email and hashed password
    console.log(req.body);
    var suppliedUser = req.body;
    // check if user is in data base
    // make connection to database and attempt to retrieve user
    //res.status(200).send(req.body);
    pg.connect(connectionString, (err, client, done) => {
        if (err) return res.status(500)
        // attempt to retieve from database
        var check = client.query(
            'select email, password, name, role from users where email = $1',
            [suppliedUser.email]
        );
        check.on('row', function(row, result) {
            result.addRow(row);
        });
        check.on('end', function(result) {
            client.end();
            if (result.rowCount == 0) { // nothing found
                res.status(422).send('User does not exist');
                console.log('Login attempt with incorrect username');
            } else {
                var expectedUser = result.rows[0];
                var role = expectedUser.role;
                console.log(expectedUser);
                if (suppliedUser.password === expectedUser.password) {
                    req.session.user = expectedUser;                     // save the logged in user in the session
                    if (role == 'user') updateCarts(suppliedUser, req);  // successful login, update carts
                    res.send({user: expectedUser});
                } else {
                    res.status(403).send('Password is incorrect');
                    console.log('Login attempt with incorrect password');
                }
            }
        });
    });
});

router.get('/admin', function(req, res) {
    if (req.session.user == undefined || req.session.user.role != 'admin'){
        res.redirect('/');
    }
    else {
        res.render('dashboard.ejs', { layout: 'layouts/dashboard-layout', user: req.session.user});
    }

});

// register request
router.post('/register', function(req, res) {
    // request body is JSON with email, password and name
    console.log(req.body);
    var newUser = req.body;
    // perform a db lookup on user - if results user exist
    pg.connect(connectionString, (err, client, done) => {
        if (err) res.status(500).json({success: false, data: err});
        var check = client.query(
            'select email, password, name from users where email = $1',
            [newUser.email]
        );
        check.on('row', function(row, result) {
            result.addRow(row);
        });
        check.on('end', function(result) {
            if (result.rowCount > 0) { // username already exists
                client.end();
                res.status(409).send('Username already exists');
            } else {
                var insert = client.query(
                    'insert into users values($1, $2, $3)',
                    [newUser.email, newUser.password, newUser.name]
                );
                insert.on('end', function() {
                    client.end();
                    updateCarts(newUser, req);
                    req.session.user = newUser;  // save the logged in user in the session
                    res.status(201).send({user: newUser});
                });
            }
        });
    })
});

router.get('/logout', function(req, res) {
    req.session.user = undefined;
    res.status(200).send({user: undefined});
});

module.exports = router;

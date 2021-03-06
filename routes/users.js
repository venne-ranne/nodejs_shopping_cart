/*jslint node: true, unparam: true*/
/*global __dirname: false */
"use strict";
var express = require('express');
//handle client pool
var pool = require('../config/database');
var router = express.Router();
var bodyParser = require('body-parser');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;
var hash = require('crypto').createHash('sha256');
var expressLayouts = require('express-ejs-layouts');
var fs = require('fs');

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

// Middleware for geting custom headers on request and making sure they are on the response
const headers = ['name', 'email', 'role', 'cartid'];
router.use(function(req, res, next) {
    //console.log('Request to users getting/setting headers');
    for (var a = 0; a < headers.length; ++ a) {
        var header = req.get(headers[a])
        if (header !== null) {
            res.set(headers[a], header);
            //console.log(headers[a] + ' : ' + req.get(headers[a]));
        }
    }
    next();
});

// Check if the user is admin or not
router.use('/users', function(req, res, next) {
    console.log('Is Admin?')
    var role = req.get('role');
    if (role != undefined && role === 'admin') {
        console.log('Admin - request ok');
        next();
    } else {
        console.log('Not Admin - bad request');
        res.status(403).send();
        next('router');
    }
});

// Send a salt to client for them to append to passwords
var salt = 1234567890;
router.get('/login', function(req, res) {
    res.json({salt: salt});
    console.log('get request to login');
});


// Request to authenticate using google
// User has recieved a access code which is to be exchanged for tokens
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
                                res.set('email', user.email);
                                res.set('name', user.name);
                                res.status(200).send({user: user});
                            } else {
                                // new user make up password
                                hash.update(user.name + user.email + salt);
                                user.password = hash.digest('hex');
                                addNewUser(user);
                                updateCarts(user, req);
                                res.set('email', user.email);
                                res.set('name', user.name);
                                //req.session.user = user;  // save the logged in user in the session
                                res.status(201).send({user: user});
                            }
                    });
                }
            });
        } else {
            console.log('Error : ' + error);
            res.status(403).send(error);
        }{}
    });

});

// Login request
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
                        //req.session.user = expectedUser;                     // save the logged in user in the session
                        if (role == 'user') updateCarts(suppliedUser, req);  // successful login, update carts
                        res.set('email', expectedUser.email);
                        res.set('name', expectedUser.name);
                        res.send({user: expectedUser});
                    } else {
                        res.status(403).send('Password is incorrect');
                        console.log('Login attempt with incorrect password');
                    }
                }
            }
    });
});

// Get all users
router.get('/users/all', function(req, res) {
  pool.query(
      'SELECT * FROM users',
      [],
      function(error, result) {
          if (error) res.status(500).send('Database query error');
          res.status(200).send(result.rows);
  });
});

// Delete a user
router.delete('/users/row', function(req, res) {
  var email = req.body.email;
  pool.query('DELETE FROM users WHERE email= $1', [email],
      function(error, result) {
          if (error) res.status(500).send('Database query error');
          res.status(200).send({status: "success"});
  });
});

// Change a users details
router.put('/users/row', function(req, res) {
  var email = req.body.email;
  var name = req.body.name;
  var role = req.body.role;
  pool.query('UPDATE users SET name = $1, role = $2 WHERE email= $3', [name, role, email],
      function(error, result) {
          if (error) res.status(500).send('Database query error');
          res.status(200).send({status: "success"});
      });
});

// Saves all the users to a json file on the server and sends it for download to the client
router.get('/users/save', function(req, res) {
    // get all users
    pool.query(
        'SELECT * FROM users',
        [],
        function(error, result) {
            if (error) res.status(500).send('Database query error');
            else {
                // write to file
                var users = JSON.stringify(result.rows);
                var filename = __dirname + '/saves/Users-' + Date.now().toString() + '.json';
                fs.writeFile(
                    filename,
                    users,
                    function(error) {
                        // serve file for download
                        res.sendFile(filename);
                    });
            }
    });
});

router.get('/admin', function(req, res) {
    // if (req.get('userName') === undefined || req.get('userRole') != 'admin'){
    //     //res.redirect('/');
    // } else {
    //     //console.log("fdfdf");
    //     pool.query('select * from products', function(error, result) {
    //         res.status(200).render('admin.ejs',
    //             {
    //                 products: result.rows,
    //             }
    //         );
    //     });
    // }
});

// Register request
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
                res.set('email', newUser.email);
                res.set('name', newUser.name);
                // res.set({
                //     'Content-Type': 'text/plain',
                //     'email': newUser.email,
                //     'name': newUser.name
                // });
                //req.session.user = newUser;  // save the logged in user in the session
                res.status(201).send({user: newUser});
            }
    });
});

// Logout the current user
router.get('/logout', function(req, res) {
    console.log('Request to logout');
    for (var a = 0; a < headers.length; ++ a) {
        res.set(headers[a], 'null');
    }
    res.status(200).send({user: undefined});
});

// This function assumes a check has been done if a user exists
// Sets role to user
function addNewUser(user) {
    console.log('Adding new user...')
    pool.query(
        'insert into users values($1, $2, $3, $4)',
        [user.email, user.password, user.name, 'user']
    );
}

// Asigning a user post login to a preowned cart
function updateCarts(user, req) {
    if (req.get('cartid') != undefined) {
        console.log('Updating user...');
        pool.query(
            'update carts set email = $1 where cartid = $2',
            [user.email, req.get('cartid')],
            function(error, result) {}
        );
    }
}
module.exports = router;

// imports
var express = require('express');
var bodyParser = require('body-parser');
var pg = require('pg');
var fs = require('fs');
var session = require('express-session');

// server parameters
//var connectionString = process.env.DATABASE_URL;
//var connectionString = "postgres://localhost:5432/conor";
var connectionString = "postgres://localhost:5432/yappvivi_jdbc";
var port = process.env.PORT || 8080; ;
var googleClientID = '529872489200-j1bfbmtusgon8q8hat64pguokitqh6j6.apps.googleusercontent.com';
var googleClientSecret = 'VTUS2aQdug6oKtDzSt4m6g_3'
var salt = 1234567890;

var expressLayouts = require('express-ejs-layouts');

// start express application
var app = express();

// static files such as css, js, resource files in views folder
app.use(express.static('./views'));

//start server listening
app.listen(port, function() {
    console.log("Server running on port : " + port);
});

// setup body parser to use JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
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
    res.render('index.ejs', { user: req.session.user });
});

app.put('/cart', function(req, res) {
    var product = req.body.id;
    var cart = req.session.cartid;

    pg.connect(connectionString, function(err, client, done) {
        if (err) res.status(500).send('Database connection error');
        var addString = 'insert into incarts (cartid, id, quantity) values ($1, $2, 1) ' +
            'on conflict (cartid, id) do update ' +
            'set quantity = (select quantity from incarts where cartid=$1 and id=$2) + 1';
        //console.log(addString);
        //console.log(cart);
        //console.log(product);

        client.query('UPDATE carts SET total_items = total_items + 1 WHERE cartid = ($1);', [cart]);  // just update the total items in the cart
        var add = client.query(
            //'insert into incarts (cartid, id, quantity) values ($1, $2, 1) on conflict (cartid, id) do update set quantity = (select quantity from incarts where cartid=$1 and id=$2) + 1',
            addString,
            [cart, product]
        );
        add.on('error', function(error) {
            console.log(error);
            res.status(500).send('Database query error');
        });
        add.on('row', function(row, result) { result.addRow(row); })
        add.on('end', function(result) {
            var p = client.query(
                'select name, description, price, new, sale, stock, category, imagepath, id from products where id=$1',
                [product]
            );
            p.on('error', function(error) {
                client.end();
                console.log(error);
                res.status(420).send('Database query error');
            });
            p.on('row', function(row, result) { result.addRow(row); });
            p.on('end', function(result) {
                client.end();
                console.log(result.rows);
                res.status(201).send(result.rows); });
        });
    });
});

// create new shopping cart page
app.post('/cart', function(req, res) {
    // add row to database for cart
    pg.connect(connectionString, function(err, client, done) {
        if (err) res.status(500).send('Database connection error');
        var user = req.session.user || 'guest';
        if (req.session.user != undefined) user = req.session.user.email;  // if the user logged in, then updated
        var insert = client.query('insert into carts values(default, $1) returning cartid', [user]);
        insert.on('error', function(error) { res.status(500).send('Database query error'); });
        insert.on('row', function(row, result) {
            req.session.cartid = row.cartid;
            result.addRow(row);
        });
        insert.on('end', function(result) {
            client.end();
            // return id to user
            console.log(result.rows);
            res.status(201).json(result.rows[0]);
        });
    });
    // return cart number back to users
});

// get request on shopping cart will get an array of items in the cart
app.get('/cart', function(req, res) {
    var cartid = req.session.cartid;
    if (cartid != undefined && cartid !== '') {
        pg.connect(connectionString, function (err, client, done) {
            if (err) res.status(500).send('Database connection error');
            var query = client.query('select * from products, incarts where products.id = incarts.id and cartid = $1',[cartid]);
            query.on('error', function(error) {
                res.status(500).send('Database query error');
            });
            query.on('row', function(row, result) {
                result.addRow(row);
            });
            query.on('end', function(result) {
                client.end();
                console.log(result.rows);
                res.status(200).send(result.rows);
            });
        });
    }
});

// get request on total number of items in the cart
app.get('/totalcart', function(req, res) {
    var cartid = req.session.cartid;
    if (cartid != undefined && cartid !== '') {
        pg.connect(connectionString, function (err, client, done) {
            var totalNumber = 0;
            if (err) res.status(500).send('Database connection error');
            var query = client.query('select total_items from carts where cartid = ($1);',[cartid]);
            query.on('error', function(error) {
                res.status(500).send('Database query error on GET totalcart..');
            });
            query.on('row', function(row) { totalNumber = row.total_items;});
            query.on('end', function() {
                done();
                res.status(200).send({total:totalNumber});
            });
        });
    } else {
        res.status(200).send({total: 0});
    }
});

// root page
app.get('/collections', function(req, res) {
    var searchPattern = req.query.search;
    var collection = req.query.collection;
    var sale = req.query.sale;
    var newProduct = req.query.new;
    if (searchPattern != undefined && searchPattern !== '') { // there is a search string and it's not empty
        pg.connect(connectionString, function (err, client, done) {
            if (err) res.status(500).send('Database connection error');
            searchPattern = '%' + searchPattern + '%';
            var query = client.query( // ilike is case insensitve like
                'select name, description, price, new, sale, stock, category, imagepath, id from products where name ilike $1 or description ilike $1',
                [searchPattern]
            );
            query.on('error', function(error) {
                res.status(500).send('Database query error');
            });
            query.on('row', function(row, result) {
                result.addRow(row);
            });
            query.on('end', function(result) {
                client.end();
                if (result.rowCount == 0) {
                    console.log('Nothing found show all');
                    res.send("NOT FOUND");
                    //res.redirect('collections/everything');
                } else {
                    console.log(result.rows);
                    res.status(200).json(result.rows);
                }
            });
        });
    } else {
        // nothin to search redirect to everything
        res.redirect('/collections/everything');
    }

    // else if (collection != undefined ) {
    //     // select on collection
    // } else if (sale) {
    //     //
    // } else {
    //     // nothin to search redirect to everything
    //     console.log('No search show all');
    //     pg.connect(connectionString, function(err, client, done) {
    //         if (err) res.status(500).send('Database connection error');
    //         var products = client.query(
    //             'select name, description, price, new, sale, stock, category, imagepath, id from products'
    //         );
    //         products.on('error', function(error) { res.status(500).send('Database query error'); });
    //         products.on('row', function(row, result) { result.addRow(row); });
    //         products.on('end', function(result) {
    //             client.end();
    //             res.status(200).json(result.rows);
    //         });
    //     });
    //     //res.redirect('collections/everything');
    //}
});

// retrive all items in stock based on the category name
app.get('/collections/:category', function(req, res) {
    var category = req.params.category;
    var query, queryCmd;
    pg.connect(connectionString, (err, client, done) => {
      if (err){
          done();
          res.status(500).send('Database connection error');
          console.log("GET collections error... Database connection error.");
          console.log(err);
      }

      if (category == 'everything'){
          queryCmd = 'SELECT *  FROM products;';
          query = client.query(queryCmd);
      } else if (category == 'new'){
          queryCmd = 'SELECT * FROM products WHERE new = ($1);';
          query = client.query(queryCmd, [true]);
      } else if (category == 'sale'){
          queryCmd = 'SELECT * FROM products WHERE sale = ($1);';
          query = client.query(queryCmd, [true]);
      } else {
          done();
          res.status(500).send('GET collections... CATEGORY NOT FOUND!');
      }
      query.on('row', function(row, result) {
        result.addRow(row);
      });
      query.on('end', function(result) {
          done();
          //client.end();
          res.status(200).render('collections.ejs', {user: req.session.user, products:result.rows});
      });
    });
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

    pg.connect(connectionString, (err, client, done) => {
        if (err) return res.status(500)
        // attempt to retieve from database
        var check = client.query(
            'select email, password, name from users where email = $1',
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
                console.log(expectedUser);
                if (suppliedUser.password === expectedUser.password) {
                    // successful login
                    updateCarts(suppliedUser, req);
                    req.session.user = expectedUser;  // save the logged in user in the session
                    res.send({user: expectedUser});
                    //res.json(expectedUser);
                } else {
                    res.status(403).send('Password is incorrect');
                    console.log('Login attempt with incorrect password');
                }
            }
        });
    });
});

// register request
app.post('/register', function(req, res) {
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
                    res.send({user: newUser});
                    //res.status(201).send(newUser);
                });
            }
        });
    })
});

// // get a product using id to add into shopping card
// app.get("/collections/:id", function (req, res){
//   var id = req.params.id;
//   var query, queryCmd;
//
//   pg.connect(connectionString, (err, client, done) => {
//     if (err){
//       done();
//       console.log("get a product using id error");
//       console.log(err);
//       return res.status(500).json({success: false, data: err});
//     }
//
//     queryCmd = 'SELECT row_to_json(products) FROM products WHERE id = ($1);';
//     query = client.query(queryCmd, [id]);
//
//     query.on('row', function(row, result) {
//         result.addRow(row.row_to_json);
//     });
//     query.on('end', function(result) {
//         client.end();
//         res.status(200).send(result);
//     });
//   });
// });

app.get('/logout', function(req, res) {
    //req.session.destroy();
    req.session.user = undefined;
    res.status(200).send({user: undefined});
});

function updateCarts(user, req) {
    if (req.session.cartid == undefined) return;  // means the user haven't add anything to the cart yet
    console.log('Updating user ...');
    pg.connect(connectionString, function(err, client, done) {
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

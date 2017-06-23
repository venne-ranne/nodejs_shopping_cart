var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');

// postgres database pool
const pool = require('../db');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(session({
    secret: 'iloveblackrabbitproject',
    resave: false,
    saveUninitialized: true
})); // session secretgit

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
            done();
            req.session.totalcart = req.session.totalcart + 1;
            res.status(201).send({totalcart: req.session.totalcart}); // just return the total # cart
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
            req.session.totalcart = 0;
            result.addRow(row);
        });
        insert.on('end', function(result) {
            client.end();
            // return id to user
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
                res.status(200).send(result.rows);
            });
        });
    }
});

// delete an item from the cart
app.delete('/cart', function(req, res) {
    var cartid = req.session.cartid;
    var quantity = req.body.numItems;
    var product = req.body.id;
    if (cartid != undefined && cartid !== '') {
        pg.connect(connectionString, function (err, client, done) {
            if (err) res.status(500).send('Database connection error');
            var query = client.query('DELETE FROM incarts WHERE cartid = $1 AND id = ($2)',[cartid, product], function (err) {
                        if (err){
                            done();
                            console.log(err);
                            res.status(500).send('Database query error');
                        }});
            query = client.query('SELECT id, name, price FROM products WHERE id = ($1)',[product]);
            query.on('error', function(error) {
                done();
                console.log(err);
                res.status(500).send('Database query error');
            });
            query.on('row', function(row, result) {
                console.log(row);
                result.addRow(row);
            });
            query.on('end', function(result) {
                done();
                req.session.totalcart = req.session.totalcart - quantity;
                res.status(200).send({user: req.session.user, products:result.rows, totalcart: req.session.totalcart});
            });
        });
    }
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

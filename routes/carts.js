var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var session = require('express-session');
var expressLayouts = require('express-ejs-layouts');

// postgres database pool
var pool = require('../config/database');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
router.use(expressLayouts);

router.use(session({
    secret: 'iloveblackrabbitproject',
    resave: false,
    saveUninitialized: true
})); // session secretgit

router.use(function(req, res, next) {
    console.log('Request to carts');
    console.log('User name : ' + req.get('name'));
    console.log('User email : ' + req.get('email'));
    console.log('User role : ' + req.get('role'));
    console.log('Cart ID : ' + req.get('cartid'));
    var cartid = req.get('cartid');
    var user = req.get('name');
    if (cartid == undefined) { // need new cart id
        pool.query('insert into carts values(default, $1) returning cartid', [user],
        function(error, result) {
            if (!error) {
                var row = result.rows[0];
                // addCart to response headers
                res.set('cartid', row.cartid);
                //res.status(201).json(result.rows[0]);
            }
            next();
        });
    } else {
        // has cart do nothing
        next();
    }
});

// add a product to a cart
router.put('/', function(req, res) {
    var product = req.body.id;
    var cart = req.get('cartid');
    var addString = 'insert into incarts (cartid, id, quantity) values ($1, $2, 1) ' +
        'on conflict (cartid, id) do update ' +
        'set quantity = (select quantity from incarts where cartid=$1 and id=$2) + 1';
    pool.query(addString, [cart, product], function(error, result) {
        if (!error) {
            res.status(201).send({totalcart: req.session.totalcart}); // just return the total # cart
        } else res.status(500).send('Database query error');
    });
});

// return all rows in carts table along with sub-total
router.get('/all', function(req, res) {
    pool.query('select * from carts',
        function(error, result) {
            if (error) res.status(500).send('Database query error');
            res.status(200).send(result.rows);
    });
});

// detele a row in carts table
router.delete('/all/row', function(req, res) {
    var cart = req.body.cartid;
    pool.query('DELETE FROM carts WHERE cartid = $1', [cart],
        function(error, result) {
            if (error) res.status(500).send('Database query error');
            res.status(200).send({status: "success"});
    });
});

// get request on shopping cart will get an array of items in the cart
router.get('/', function(req, res) {
    var cartid = req.get('cartid');
    if (cartid != undefined && cartid !== '') {
        pool.query(
            'select * from products, incarts where products.id = incarts.id and cartid = $1',
            [cartid],
            function(error, result) {
                if (error) res.status(500).send('Database query error');
                res.status(200).send(result.rows);
        });
    }
});

// delete an item from the cart
router.delete('/', function(req, res) {
    var cartid = req.session.cartid;
    var quantity = req.body.numItems;
    var product = req.body.id;
    if (cartid != undefined && cartid !== '') {
        pool.connect(function (error, client, done) {
            if (error) res.status(500).send('Database connection error');
            client.query(
                'DELETE FROM incarts WHERE cartid = $1 AND id = ($2)',
                [cartid, product],
                function (err, result) {
                    if (err) res.status(500).send('Database query error');
            });
            client.query(
                'SELECT id, name, price FROM products WHERE id = ($1)',
                [product],
                function(err, result) {
                    done(err);
                    if (err) res.status(500).send('Database query error');
                    req.session.totalcart = req.session.totalcart - quantity;
                    res.status(200).send({user: req.session.user, products:result.rows, totalcart: req.session.totalcart});
            });
        });
    }
});

// update the quantity of a product in cart
router.put('/quantity', function(req, res) {
    var product = req.body.id;
    var quantity = req.body.quantity;
    var cart = req.session.cartid;
    var updateString = 'update incarts set quantity = ($1) where cartid=($2) and id=($3)';
    pool.query(updateString [quantity, cart, product], function(error, result) {
        if (error) res.status(500).send('Database query error');
        req.session.totalcart = req.session.totalcart + quantity;
        res.status(201).send({totalcart: req.session.totalcart}); // just return the total # cart
    });
});

router.post('/checkout', function(req, res) {
    
});

module.exports.updateCarts = function(user, req) {
    if (req.session.cartid == undefined) return;  // means the user haven't add anything to the cart yet
    console.log('Updating user ...');
    pool.query(
        'update carts set email = $1 where cartid = $2',
        [user.email, req.session.cartid],
        function(error, result) {
            console.log('Updating user done.');
        }

    )
}

module.exports = router;

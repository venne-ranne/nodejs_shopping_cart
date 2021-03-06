var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var expressLayouts = require('express-ejs-layouts');

// postgres database pool
var pool = require('../config/database');

// Request bodies will be in JSON
router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.use(expressLayouts);

// middleware for geting custom headers on request and making sure they are on the response
const headers = ['name', 'email', 'role', 'cartid'];
router.use(function(req, res, next) {
//console.log('Request to carts, getting/setting headers');
    for (var a = 0; a < headers.length; ++ a) {
        var header = req.get(headers[a]);
        if (header !== null) {
            res.set(headers[a], header);
            //console.log(headers[a] + ' : ' + req.get(headers[a]));
        }
    }
    next();
});

// Check if the user is admin or not
router.use('/all', function(req, res, next) {
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

// Returns the size of a users cart given a cartid
router.get('/size', function(req, res) {
    var cartid = req.get('cartid');
    //console.log(cartid);
    if (cartid == undefined || isNaN(cartid)) {
        res.status(200).send({total: 0});
    } else {
    pool.query(
        'select SUM(incarts.quantity) from incarts where cartid = $1',
        [cartid],
        function(error, result) {
            if (!error) {
                res.status(200).send({total :result.rows[0]});
            } else {
                res.status(500).send('Insert into carts Error : ' + error);
            }
    });
}
});

// add a product to a cart
router.put('/', function(req, res) {
    console.log('Adding an item to cart ' + req.body.id);
    var product = req.body.id;
    var cart = req.get('cartid');
    var user = req.get('email') || 'guest';
    var addString = 'insert into incarts (cartid, id, quantity) values ($1, $2, 1) ' +
       'on conflict (cartid, id) do update ' +
       'set quantity = (select quantity from incarts where cartid=$1 and id=$2) + 1';
    pool.query(
        addString,
        [cart, product],
        function(error, result) {
            if (!error) {
                res.status(201).send({total:0});
            } else {
                res.status(500).send('Adding item to cart Error : ' + error);
            }
    });
});

// Has no cart yet, Make cart
router.post('/', function(req, res) {
    console.log('Making a new cart');
    var user = req.get('email');
    pool.query(
        'insert into carts (email) values($1) returning cartid',
        [user],
        function(error, result) {
            var cart = result.rows[0].cartid;
            console.log(cart);
            res.set('cartid', cart);
            res.status(201).send(JSON.stringify({cartid : cart}));
    });
});

// return all rows in carts table along with sub-total
router.get('/all', function(req, res) {
    var queryString = 'SELECT cartid, email, sold, total_items, date_added,'+
    '(SELECT SUM( incarts.quantity * (SELECT price FROM products WHERE id = incarts.id) ) FROM incarts WHERE cartid = carts.cartid)' +
    'AS subtotal FROM carts ORDER BY date_added DESC';
    pool.query(queryString,
        function(error, result) {
            if (error) res.status(500).send('Database query error');
            else res.status(200).send(result.rows);
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
    var cartid = undefined;
    if (req.get('role') === 'admin') {
        cartid = req.body.cartid;
    } else cartid = req.get('cartid');
    if (cartid != undefined && !isNaN(cartid)) {
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
    var cartid = req.get('cartid');
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
                    //req.session.totalcart = req.session.totalcart - quantity;
                    res.status(200).send({user: req.get('name'), products:result.rows});
            });
        });
    }
});

// update the quantity of a product in cart
router.put('/quantity', function(req, res) {
    var product = req.body.id;
    var quantity = req.body.quantity;
    var cart = req.get('cartid');
    if (cart != undefined) {
        var updateString = 'update incarts set quantity = ($1) where cartid=($2) and id=($3)';
        pool.query(updateString [quantity, cart, product], function(error, result) {
            if (error) res.status(500).send('Database query error');
            else res.status(201).send();
        });
    } else res.status(400).send('cartid header must be set');
});

// get request on shopping cart will get an array of items in the cart
router.post('/admin/cart', function(req, res) {
    var cid = req.body.cartid;
    console.log("dsdsd "+cid);
    pool.query(
        'select * from products, incarts where products.id = incarts.id and cartid = $1',
        [cid],
        function(error, result) {
            if (error) res.status(500).send('Database query error');
            res.status(200).send(result.rows);
    });
});

// delete an item from the cart
router.delete('/admin/cart', function(req, res) {
    var cartid = req.body.cartid;
    var quantity = req.body.numItems;
    var product = req.body.id;
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
                //req.session.totalcart = req.session.totalcart - quantity;
                res.status(200).send({user: req.get('name'), products:result.rows});
        });
    });
});

router.post('/checkout', function(req, res) {
    var cartid = req.get('cartid');
    var updateString = 'update carts set sold = ($1) where cartid=($2)';
    pool.query(updateString, ['true', cartid], function(error, result) {
        if (error) res.status(500).send('Database query error');
        res.set('cartid', 'null');
        res.status(200).send();
    });
});


module.exports = router;

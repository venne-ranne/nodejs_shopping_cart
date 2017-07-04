var express = require('express');
var router = express.Router();
var bodyParser = require('body-parser');
var expressLayouts = require('express-ejs-layouts');
var session = require('express-session');

// postgres database pool
var pool = require('../config/database');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// // set up template engine
//router.set('view engine', 'ejs');
router.use(expressLayouts);
//router.set('layout', 'layouts/layout');

// Middleware for geting custom headers on request and making sure they are on the response
const headers = ['name', 'email', 'role', 'cartid'];
router.use(function(req, res, next) {
    console.log('Request to users getting/setting headers');
    for (var a = 0; a < headers.length; ++ a) {
        var header = req.get(headers[a])
        if (header !== null) {
            res.set(headers[a], header);
            console.log(headers[a] + ' : ' + req.get(headers[a]));
        }
    }
    next();
});

// collections page
router.get('/', function(req, res) {
    var searchPattern = req.query.search;
    if (searchPattern != undefined && searchPattern !== '') { // there is a search string and it's not empty
        searchPattern = '%' + searchPattern + '%';
        // ilike is case insensitve like
        pool.query('select name, description, price, new, sale, stock, category, imagepath, id from products where name ilike $1 or description ilike $1',
            [searchPattern],
            function (error, result) {
                if (error) res.status(500).send('Database query error');
                if (result.rowCount == 0) res.status(204).send("NOT FOUND");
                else res.status(200).json(result.rows);
        });
    } else {
        // nothin to search show everything
        pool.query('select name, description, price, new, sale, stock, category, imagepath, id from products',
            [], function (error, result) {
                if (error) res.status(500).send('Database query error');
                else res.status(200).json(result.rows);
        });
    }
});

// // items to put on index.ejs
// router.post('/new', function(req, res) {
//     pool.query('select * from products where new = $1',[true],
//         function (error, result) {
//             if (error) res.status(500).send('Database query error');
//             if (result.rowCount == 0) res.status(204).send("NOT FOUND");
//             else res.status(200).json(result.rows);
//     });
// });

// retrive all items in stock based on the category name
router.get('/:category', function(req, res) {
    //if (req.session.totalcart == undefined) req.session.totalcart = 0;
    var category = req.params.category;
    var query, queryCmd;

    var qString;
    var qParameters;
    switch (category) {
        case 'new' :
            qString = 'select * from products where new = $1';
            qParameters = [true];
            break;
        case 'sale' :
            qString = 'select * from products where sale = $1';
            qParameters = [true];
            break;
        case 'homewares' :
            qString = 'select * from products where category = $1';
            qParameters = ['Homewares'];
            break;
        case 'homedecor' :
            qString = 'select * from products where category = $1';
            qParameters = ['Home Decor'];
            break;
        case 'arts' :
            qString = 'select * from products where category = $1';
            qParameters = ['Arts'];
            break;
        default :
            qString = 'select *  from products';
            qParameters = [];
    }
    pool.query(qString, qParameters, function(error, result) {
        res.status(200).render('collections.ejs',
            {
                user: req.get('name'),
                products: result.rows,
                totalcart: 0
            }
        );
    });
});

module.exports = router;

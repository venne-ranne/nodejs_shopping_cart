const pg = require('pg');

// 15 connections to keep under heroku limit
var config = {
    max: 15,
    idleTimeoutMillis: 30000
};

const pool = new pg.Pool(config);

pool.on('error', function (err, client) {
    console.error('idle client error', err.message, err.stack);
});

// pass a query to the pool
module.exports.query = function(text, values, callback) {
    console.log('query : ', text, values);
    return pool.query(text, values, callback);
}

// get a connection from the pool
module.exports.connect = function (callback) {
    return pool.connect(callback);
};

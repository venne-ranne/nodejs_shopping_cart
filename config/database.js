/**
 * Created by adamf on 25/06/17.
 */
// config/database.js
const url = require('url');
const pg = require('pg');

// the local DB URL needs to be changed to your own settings
//var localDBUrl = "postgres://localhost:5432/conor";
//var localDBUrl = "postgres://localhost:5432/yappvivi_jdbc";
//var localDBUrl = "postgres://tzoqkrwdfkcpjk:218d44fac9bfeaa3024a91549b7d51edb57435498757eda751de43663882bee3@ec2-23-21-220-188.compute-1.amazonaws.com:5432/d321mldt4f912o";
var databaseUrl = process.env.DATABASE_URL;// || localDBUrl;
var params = url.parse(databaseUrl);
var auth = params.auth.split(':');

var config = {
    max: 15,
    idleTimeoutMillis: 30000,
    user: auth[0],
    password: auth[1],
    host: params.hostname,
    port: params.port,
    database: params.pathname.split('/')[1],
    ssl: true   // NOTICE: if connecting on local db, this should be false

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

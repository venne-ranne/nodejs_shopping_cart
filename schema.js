// This script is to set up the psql database with appropriate tables
var pg = require('pg');
var connectionString = process.env.DATABASE_URL;

var client = new pg.Client(connectionString);
client.connect();


/* Create main product database
    varchar(255) : Product name
    varchar(1024) : Product description
    numeric : Product price
    boolean : New Product
    boolean : Sale Product
    integer : Product quantity
    varchar(128) : Product category
    varchar(255) : Path to image resource
*/
var queryString = 'create table products (name varchar(255), ' +
                                                'description varchar(1024), ' +
                                                'price numeric, ' +
                                                'new boolean, ' +
                                                'sale boolean, ' +
                                                'stock integer, ' +
                                                'category varchar(255), ' +
                                                'imagePath varchar(255))';
var makeProductTable = client.query(queryString);
makeProductTable.on('end', function(result) {
    client.end();
});

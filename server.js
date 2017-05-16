var express = require('express');
var port = 5555;

var app = express();

// root page
app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
})

// start server listening
app.listen(port, function(error) {
    console.log('Listening on port ' + port);
});

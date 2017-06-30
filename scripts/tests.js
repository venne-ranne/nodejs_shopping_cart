const execSync = require('child_process').execSync;

const curl = 'curl ';

var server = 'https://guarded-falls-74429.herokuapp.com'

// options for http requests
var get = '-s -H "Content-Type: application/json" -X GET';
var put = '-s -H "Content-Type: application/json" -X PUT -d';
var post = '-s -X POST -H "Content-Type: application/json" -d';
var del = '-s -H "Content-Type: application/json" -X DELETE -d';

var routes = [
    '/login',
    '/register',
    '/admin',
    '/logout',
    '/collections',
    '/collections?search=bear'
];

runTests();
function runTests() {
    var data;
    // test GET -> /login
    performTest(get, routes[0]);

    // test POST -> /login
    data = {
        email: "user@email.com",
        password: "210dd29b4ca6785b68f0ebf82a2b42ee823548d173ae8fb92fc8417c0c460a9b"
    }
    performTest(post, routes[0], stringifyData(data));

    // test GET -> /admin
    performTest(get, routes[2]);

    // test POST -> /register
    data = {

    }
    performTest(post, routes[1], stringifyData(data));


    // test GET -> /collections
    performTest(get, routes[4]);

    // test GET -> /collections?search=bear
    performTest(get, routes[5]);

    // test
}


function performTest(method, route, data) {
    console.log('\nRunning request :');
    var cmd = curl + method;
    var url = ' ' + server + route;
    var request = undefined;
    if (data != undefined) request  = cmd + data + url;
    else request = cmd + url;
    console.log (request);
    console.log("Response :");
    var response = execSync(request, {
        encoding: 'UTF-8'
    });
    console.log(response);
    return response;
}

// make an object into a string to be processed from the commandline
function stringifyData(obj) {
    return "'" + JSON.stringify + "'";
}

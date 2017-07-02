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
    '/carts',
    '/collections'
];

runTests();
function runTests() {
    var data;
    // test GET -> /login
    performTest(get, routes[0]);

    // test POST -> /login - bad login
    data = {
        email: "xyz@email.com",
        password: "210dd29b4ca6785b68f0ebf82a2b42ee823548d173ae8fb92fc8417c0c460a9b"
    }
    performTest(post, routes[0], stringifyData(data));

    // test POST -> /login - good login, bad password
    data = {
        email: "abc@email.com",
        password: "password"
    }
    performTest(post, routes[0], stringifyData(data));

    // test POST -> /login - good login, good password
    data = {
        email: "abc@email.com",
        password: "a5bfa04a298b1d647da842935d1b3fafa89f8e2a9eceb930a05fee22c9de992c"
    }
    performTest(post, routes[0], stringifyData(data));

    // test GET -> /admin
    performTest(get, routes[2]);

    // test POST -> /register - bad login
    data = {
        email: "abc@email.com",
        password: "password",
        name: "cba"
    }
    performTest(post, routes[1], stringifyData(data));

    // test POST -> /register - ok login
    var randLogin = Math.random();
    data = {
        email: randLogin.toString(),
        password: "password",
        name: "Random User"
    }
    performTest(post, routes[1], stringifyData(data));

    // test GET -> /logout
    performTest(get, routes[3]);

    // // test GET -> /carts
    // performTest(get, routes[4]);
    //
    // // test POST -> /carts
    // performTest(post, routes[4]);
    //
    // // test PUT -> /carts
    // performTest(put, routes[4]);
    //
    // // test DELETE -> /carts
    // performTest(del, routes[4]);

    // test GET -> /collections
    performTest(get, routes[5]);

    // test GET -> /collections?search=bear
    performTest(get, routes[5] + '?search=bear');

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
    return "'" + JSON.stringify(obj) + "'";
}

var express = require('express');

// Project files
var auth = require('./server/lib/auth.service');
var store = require('./server/lib/store.service.js');
var middleware = require('./server/lib/middleware.js');
var routes = require('./server/lib/routes.js');


// ----------------------------
// Config
// ----------------------------
var config = {
    port: 4000,
    secret: 'simple secret',  // TODO: Dynamically generate secret key
    paths: {
        tokenWhitelist: ['/', '/login', '/signup'],
        loginBlacklist: ['/login', '/signup']
    }
}


// ----------------------------
// App setup
// ----------------------------
var app = express(); // Start Express instance


// ----------------------------
// Middleware settings
// ----------------------------
middleware.init({
    app: app,
    config: config
});


// ----------------------------
// Routes
// ----------------------------
routes.init({
    app: app,
    auth: auth,
    store: store,
    secret: config.secret
});


// ----------------------------
// App start
// ----------------------------
app.listen(config.port, function() {
    console.log('App listening on port ' + config.port + '...');
});
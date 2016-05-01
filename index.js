var express = require('express');
var uuid = require('node-uuid');

// Project files
var auth = require('./server/lib/auth.service');
var store = require('./server/lib/in-memory.store');
var middleware = require('./server/lib/middleware.config');
var routes = require('./server/lib/routes.config');


// ----------------------------
// Config
// ----------------------------
var config = {
    title: 'Brand',
    port: process.env.PORT || 4000,
    secret: uuid.v4(), // Generate RFC4122 unique identifier
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
var express = require('express');

// Project files
var config = require('./server/lib/config');
var auth = require('./server/lib/auth.service');
var store = require('./server/lib/mongo.store');
var middleware = require('./server/lib/middleware.config');
var routes = require('./server/lib/routes.config');


// ----------------------------
// App setup
// ----------------------------
var app = express(); // Start Express instance
store.init(config); // Setup data store

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
    config: config,
    store: store
});


// ----------------------------
// App start
// ----------------------------
app.listen(config.port, function() {
    console.log('App listening on port ' + config.port + '...');
});
var express = require('express');

// Project files
var config = require('./server/lib/config');
var auth = require('./server/lib/auth.service');
var store = require('./server/lib/in-memory.store'); // TODO: Connect to database rather than in-memory object
var middleware = require('./server/lib/middleware.config');
var routes = require('./server/lib/routes.config');


// ----------------------------
// App setup
// ----------------------------
var app = express(); // Start Express instance
auth.init({ // TODO: find better way of doing this?
    config: config,
    store: store
});


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
    auth: auth
});


// ----------------------------
// App start
// ----------------------------
app.listen(config.port, function() {
    console.log('App listening on port ' + config.port + '...');
});
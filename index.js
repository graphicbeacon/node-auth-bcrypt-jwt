var express = require('express');

// Project files
var config = require('./server/lib/config');
var auth = require('./server/lib/auth.service');
var store = require('./server/lib/user.store');
var middleware = require('./server/lib/middleware.config');
var routes = require('./server/lib/routes.config');
var email = require('./server/lib/email.service');


// ----------------------------
// App setup
// ----------------------------
var app = express(); // Start Express instance
store.init(config); // Setup data store
email.init(config); // Setup email service
auth.init({ // Initiates auth service - equivalent to creating object instance
    config: config,
    store: store,
    emailService: email
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
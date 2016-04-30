var express = require('express');

// Project files
var auth = require('./server/lib/auth.service');
var store = require('./server/lib/store.service.js');
var middleware = require('./server/lib/middleware.js');


// ----------------------------
// Config
// ----------------------------
var config = {
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
app.get('/', function(req, res) {
    res.render('index', {viewTitle: 'Hello World', content: 'Hello World'});
});

app.get('/login', function(req, res) {
    // TODO: Redirect to protected screen if already logged in
    res.render('login', {viewTitle: 'Login', content: 'Please login'});
});

app.get('/signup', function(req, res) {
    // TODO: Redirect to protected screen if already logged in
    res.render('signup', {viewTitle: 'Signup', content: 'Sign up'});
});

app.get('/protected', function(req, res) {
    res.render('protected', {viewTitle: 'Protected', content: 'User Dashboard'});
});

app.get('/logout', function(req, res) {
    // TODO: check that referrer and origin are the same domain to prevent cross site attacks
    // Remove auth cookie and redirect to login again
    res.clearCookie('auth');
    res.status(302).redirect('/login'); 
});

app.post('/login', auth.login({
    redirectTo: '/protected',
    secret: config.secret,
    store: store
}));

app.post('/signup', auth.signup({
    store: store
}));


// ----------------------------
// App start
// ----------------------------
app.listen(4000, function() {
    console.log('App listening on port 4000...');
});
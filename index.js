var express = require('express');
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');

// Project files
var auth = require('./server/lib/auth.service');
var store = require('./server/lib/store.service.js');


// ----------------------------
// Config
// ----------------------------
var globalSecret = 'simple secret'; // TODO: Dynamically generate secret key


// ----------------------------
// App setup
// ----------------------------
var app = express(); // Start Express instance


// ----------------------------
// Middleware settings
// ----------------------------
app.set('views', __dirname + '/server/views');
app.set('view engine', 'pug');
// TODO: Add express-session to ensure same valid user is making requests
app.use(bodyParser.urlencoded({extended: false})); // create application/x-www-form-urlencoded parser
app.use(cookieParser()); // Create cookie parser
app.use(expressJwt({
    secret: globalSecret,
    getToken: function fromCookies(req) {
        // Token is taken from auth cookie name that was created when logged in 
        return req.cookies.auth || null;
    }
}).unless({
    path: [ // Does not validate token if paths match any of these routes
        '/',
        '/login',
        '/signup'
    ]
}));
app.use(function(err, req, res, next) {
    if(err.name === 'UnauthorizedError') { // Handles JWT error response
        res.status(401).redirect('/login');
    }
});
app.use(function(req, res, next) { // Verifies logged in user
    var authToken = req.cookies ? req.cookies.auth : null;
    if(authToken) {
        jwt.verify(authToken, globalSecret, function(err, decoded) {
            // Validated users will have a user property on the request object
            res.locals.isLoggedIn = !!decoded;
            next();
        });
    } else {
        // Just move along
        next();   
    }
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
    secret: globalSecret,
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
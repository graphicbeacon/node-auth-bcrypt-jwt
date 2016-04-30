var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');

module.exports.init = function(config) {
    var app = config.app,
        config = config.config;
        
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'pug');
    // TODO: Add express-session to ensure same valid user is making requests
    app.use(bodyParser.urlencoded({extended: false})); // create application/x-www-form-urlencoded parser
    app.use(cookieParser()); // Create cookie parser
    app.use(expressJwt({
        secret: config.secret,
        getToken: function fromCookies(req) {
            // Token is taken from auth cookie name that was created when logged in 
            return req.cookies.auth || null;
        }
    }).unless({
        path: config.paths.tokenWhitelist // Does not validate token if paths match any of these routes
    }));
    
    app.use(function(err, req, res, next) {
        if(err.name === 'UnauthorizedError') { // Handles JWT error response
            res.status(401).redirect('/login');
        }
    });
    
    app.use(function(req, res, next) { // Verifies logged in user
        var authToken = req.cookies.auth || null;
        if(authToken) {
            jwt.verify(authToken, config.secret, function(err, decoded) {
                // Validated users will have a user property on the request object
                res.locals.isLoggedIn = !!decoded;
                next();
            });
        } else {
            // Just move along
            next();   
        }
    });
    
    app.use(function(req, res, next) {
        var blacklistedLoggedInRoutes = config.paths.loginBlacklist.indexOf(req.url) > -1;
        // If already logged in redirect any requests to 
        // blacklisted views to dashboard screens...
        if(blacklistedLoggedInRoutes && res.locals && res.locals.isLoggedIn) {
            res.status(302).redirect('/protected');
        }
        // ...else move on
        next();
    });
}
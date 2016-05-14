var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var jwt = require('jsonwebtoken');
var session = require('express-session');

module.exports.init = function(options) {
    var app = options.app,
        config = options.config;
        
    app.set('views', __dirname + '/../views');
    app.set('view engine', 'pug');
    app.use(bodyParser.urlencoded({extended: false})); // create application/x-www-form-urlencoded parser
    app.use(cookieParser());
    app.use(session({secret: config.secret, resave: true, saveUninitialized: true})) // TODO: Replace in-memory session store
    // TODO Refactor express-jwt with passport-jwt or passport-local?
    app.use(expressJwt({
        secret: function(req, payload, done) {
            // Logging
            // console.log('[Secret]', config.secret);
            // console.log('[JWT payload]:', payload);
            // console.log('[Session]:', req.session);
            
            done(null, config.secret);
        },
        getToken: function fromCookies(req) {
            // Token is taken from auth cookie name that was created when logged in 
            return req.cookies[config.authCookie] || null;
        }
    }).unless({
        path: config.paths.tokenWhitelist // Does not validate token if paths match any of these routes
    }));
    
    app.use(function(err, req, res, next) {
        if(err.name === 'UnauthorizedError') { // Handles JWT error response
            res.clearCookie(config.authCookie);
            res.status(401).redirect('/login');
        }
    });
    
    app.use(function(req, res, next) { // Verifies logged in user
        var token = req.cookies[config.authCookie] || null;
        if(token) {
            jwt.verify(token, config.secret, function(err, decoded) {
                var isLoggedIn; 
                
                if(err) { // Remove any lingering jwt tokens
                    res.clearCookie(config.authCookie);
                }
                
                // Validated users will have a user property on the request object
                isLoggedIn = !!decoded;
                res.locals.isLoggedIn = isLoggedIn;
                
                if(isLoggedIn) {
                    res.locals.userName = req.user ? req.user.user : decoded.user;
                }
                
                next();
            });
        } else {
            // Just move along
            next();   
        }
    });
    
    app.use(function(req, res, next) {
        // If already logged in redirect any requests to
        // blacklisted views to dashboard screens...
        var blacklistedLoggedInRoutes = config.paths.loginBlacklist.indexOf(req.url) > -1;
        if(blacklistedLoggedInRoutes && res.locals && res.locals.isLoggedIn) {
            res.redirect(302, '/protected');
        } else {
            // ...else move on
            next();
        }
    });
}
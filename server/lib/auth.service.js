var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var config, store; // Will be populated when init is run

module.exports.init = function(options) {
    config = options.config;   
    store = options.store; 
}

module.exports.login = function(options) {
    var redirectTo = options.redirectTo;
        
    return function(req, res) {
        var body = req.body;
        var user = store.getUser(body.username, body.password);
        
        if(typeof user === 'object') {
            // creates a json web token to distribute as logged in bearer
            var responseToken = jwt.sign({user: body.username}, config.secret, {
                issuer: config.title,
                subject: body.username
            });
            
            // Put signed token in cookie to be used in subsequent requests
            res.cookie(config.authCookie, responseToken);
            res.status(200).redirect(redirectTo);
        } else {
            res.status(401).send('Invalid username or password!');
        }
    }
}

module.exports.signup = function(req, res) {
    var username = req.body.username,
        password = req.body.password,
        passwordRepeat = req.body.passwordRepeat;
    
    if(!username || !password || !passwordRepeat) { // Not enough creds to create user
        res.status(401).send('Not enough information to create user.');    
    } else if(password !== passwordRepeat) { // Passwords not matching
        res.status(401).send('Passwords do not match.');
    } else if(store.isExistingUser(username)) { // Username already taken
        res.status(401).send('Username already exists! Please create a new one.');
    } else {
        // Populate database with supplied details
        store.addUser(username, password);
        
        // Success!
        res.status(200)
            .set('Content-Type', 'text/html')
            .send('Successfully created user. Please <a href="/login">login to your account</a>.');
    }
}

module.exports.logout = function(req, res) {
    // TODO: check that referrer and origin are the same domain to prevent cross site attacks
    // Remove auth cookie and redirect to login again
    res.clearCookie(config.authCookie);
    res.status(302).redirect('/login'); 
}
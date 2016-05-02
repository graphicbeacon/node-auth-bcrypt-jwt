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
        
        store.getUser(body.username, body.password)
            .then(function(user) {
                // creates a json web token to distribute as logged in bearer
                var responseToken = jwt.sign({user: user.user}, config.secret, {
                    issuer: config.title,
                    subject: user.user
                });
                
                // Put signed token in cookie to be used in subsequent requests
                res.cookie(config.authCookie, responseToken);
                res.status(200).redirect(redirectTo);
            }, function(err) {
                res.status(401)
                    .set('Content-Type', 'text/html')
                    .send('Invalid username or password. Please <a href="/login">try again</a>.');
            });
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
    } else {
        store.isExistingUser(username)
            .then(function(userAlreadyExists) {
                if(userAlreadyExists) {
                    res.status(401).send('Username already exists! Please create a new one.');
                } else {
                    // Populate database with supplied details
                    store.addUser(username, password)
                        .then(function() {
                            // Success!
                            res.status(200)
                                .set('Content-Type', 'text/html')
                                .send('Successfully created user. Please <a href="/login">login to your account</a>.');
                        }, handleError); 
                }
            }, handleError);
    }
    
    function handleError(err) {
        // Failure
        res.status(400)
            .set('Content-Type', 'text/html')
            .send('There was a problem creating user. Please <a href="/signup">try again</a>.');
    }
}

module.exports.logout = function(req, res) {
    // TODO: check that referrer and origin are the same domain to prevent cross site attacks
    // Remove auth cookie and redirect to login again
    res.clearCookie(config.authCookie);
    res.status(302).redirect('/login'); 
}
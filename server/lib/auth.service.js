var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

module.exports.login = function(config) {
    var redirectTo = config.redirectTo,
        secret = config.secret,
        store = config.store;
        
    return function(req, res) {
        var body = req.body;
        
        // TODO: Connect to database rather than in-memory object
        var user = store.getUser(body.username, body.password);
        
        if(typeof user === 'object') {
            // creates a json web token to distribute as logged in bearer
            var responseToken = jwt.sign({user: body.username}, secret);
            
            // Put signed token in cookie to be used in subsequent requests
            res.cookie('auth', responseToken);
            res.status(200).redirect(redirectTo);
        } else {
            res.status(401).send('Invalid username or password!');
        }
    }
}

module.exports.signup = function(config) {
    var store = config.store;
    
    return function(req, res) {
        var username = req.body.username,
            password = req.body.password;
        
        if(!username || !password) { // Not enough creds to create user
            res.status(401).send('Not enough information to create user!');    
        } else if(store.isExistingUser(username)) { // Username already taken
            res.status(401).send('Username already exists! Please create a new one.');
        } else {
            // Populate database with supplied details
            store.addUser(username, password);
            
            // Success!
            res.status(200).send('Successfully created user!');
        }
    }
}
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
var uuid = require('node-uuid');
var config, store, emailService; // Will be populated when init is run

function handleError(res) {
    return function(err) {
        // Failure
        res.status(400)
            .set('Content-Type', 'text/html')
            .send('There was a problem creating user. Please <a href="/signup">try again</a>.');
    }
}
    
module.exports.init = function(options) {
    config = options.config;   
    store = options.store;
    emailService = options.emailService;
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
        email = req.body.email,
        password = req.body.password,
        passwordRepeat = req.body.passwordRepeat,
        activationMessage = 'We have sent you an activation link to the email address you gave us. Follow the instructions to verify your account.';
    
    if(!username || !email || !password || !passwordRepeat) { // Not enough creds to create user
        res.status(401).send('Not enough information to create user.');    
    } else if(password !== passwordRepeat) { // Passwords not matching
        res.status(401).send('Passwords do not match.');
    } else {
        store.isExistingUser(username, email)
            .then(function(userAlreadyExists) {
                if(userAlreadyExists) {
                    res.status(401).send('Username or email address already exists! Please create a new one.');
                } else {
                    // TODO: Also check there is no temp account already existing
                    store.isExistingTmpUser(username, email)
                    .then(function(tmpUserExists) {
                        if(tmpUserExists) { // Email verification link already sent for this user
                            res.status(200).send(activationMessage);
                        } else {
                            // Create temp user
                            // TODO generate temp UUID hash
                            store.addTmpUser(username, email, password)
                                .then(function(activationHash) {
                                    // Send email verification link
                                    emailService.sendActivationLink({
                                        email: email,
                                        username: username,
                                        activationHash: activationHash
                                    })
                                    .then(function(success) {
                                        // Sent activation link
                                        res.status(200)
                                            .set('Content-Type', 'text/html')
                                            .send(activationMessage);
                                    }, handleError(res)); // TODO if this fails have try again link.
                                    
                                }, handleError(res)); 
                        }
                    });
                }
            }, handleError(res));
    }
}

module.exports.activate = function(req, res) {
    var activationHash = req.params.hash;
    
    store.getTmpUser(activationHash)
        .then(function(tmpUser) {
            // TODO: Insert tmpUser into users database
            // after success remove entry in tmpUsers store
            // send success response
            
            res.status(200).send('All was good');
        }, handleError(res))
}

module.exports.logout = function(req, res) {
    // TODO: check that referrer and origin are the same domain to prevent cross site attacks
    // Remove auth cookie and redirect to login again
    res.clearCookie(config.authCookie);
    res.status(302).redirect('/login'); 
}
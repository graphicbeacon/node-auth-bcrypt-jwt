var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

module.exports.login = function(config) {
    var userDatabase = config.database,
        redirectTo = config.redirectTo,
        secret = config.secret;
        
    return function(req, res) {
        var body = req.body;
        
        // TODO: Connect to database rather than in-memory object
        var user = userDatabase.find(function(user) {
            return body.username === user.user && bcrypt.compareSync(body.password, user.pass); 
        });
        
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
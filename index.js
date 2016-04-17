var bcrypt = require('bcrypt');
var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');

// Start Express instance
var app = express();
var mockDatabase = {
    user: 'admin',
    pass: 'superman'
};
var globalSecret = 'simple secret'; // Should be dynamically generated

// Middleware settings
app.use(bodyParser.urlencoded({extended: false})); // create application/x-www-form-urlencoded parser
app.use(expressJwt({secret: globalSecret}).unless({
    path: [ // Does not validate token is paths match any of these routes
        '/', 
        '/login'
    ]
}));

app.get('/', function(req, res) {
    res.send('Hello World');
});

app.post('/login', function(req, res, next) {
    var userAuth = req.body;
    
    // TODO: Connect to database rather than in-memory object
    if(userAuth.username === mockDatabase.user &&
        userAuth.password === mockDatabase.pass) {
        
        // creates a json web token to distribute as logged in bearer
        var responseToken = jwt.sign({user: userAuth.username}, globalSecret);
        
        // console.log(responseToken);
        res.status(200).json({auth: responseToken});
    } else {
        res.status(401).send('Invalid username or password!');
    }
});

app.get('/protected', function(req, res) {
    res.send('Viewing protected route!');
});

app.listen(4000, function() {
    console.log('App listening on port 4000...');
});
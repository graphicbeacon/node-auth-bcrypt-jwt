var bcrypt = require('bcrypt');
var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');

// Start Express instance
var app = express();
var salt = bcrypt.genSaltSync(10);
var userDatabase = [
    {
        user: 'admin',
        pass: bcrypt.hashSync('superman', salt)
    }
];
var globalSecret = 'simple secret'; // TODO: Dynamically generate secret key

// Middleware settings
app.use(bodyParser.urlencoded({extended: false})); // create application/x-www-form-urlencoded parser
app.use(expressJwt({
    secret: globalSecret
    // TODO: Handle jwt error response
}).unless({
    path: [ // Does not validate token is paths match any of these routes
        '/', 
        '/login',
        '/signup'
    ]
}));

app.get('/', function(req, res) {
    res.send('Hello World');
});

app.post('/login', function(req, res) {
    var body = req.body;
    
    // TODO: Connect to database rather than in-memory object
    var user = userDatabase.find(function(user) {
       return body.username === user.user && bcrypt.compareSync(body.password, user.pass); 
    });
    
    if(typeof user === 'object') {
        // creates a json web token to distribute as logged in bearer
        var responseToken = jwt.sign({user: body.username}, globalSecret);
        
        // console.log(responseToken);
        res.status(200).json({auth: responseToken});
    } else {
        res.status(401).send('Invalid username or password!');
    }
});

app.post('/signup', function(req, res) {
    var body = req.body;
    var userExists = userDatabase.findIndex(function(user) {
        return body.username.toLowerCase() === user.user.toLowerCase();
    }) > -1;
    
    if(!body.username || !body.password) { // Not enough creds to create user
        res.status(401).send('Not enough information to create user!');    
    } else if(userExists) { // Username already taken
        res.status(401).send('Username already exists! Please create a new one.');
    } else {
        // User and pass supplied
        var salt = bcrypt.genSaltSync(10);
        var newUser = {
            user: body.username,
            pass: bcrypt.hashSync(body.password, salt)
        };
        
        // Add to database list
        userDatabase.push(newUser);
        
        // Success!
        res.status(200).send('Successfully created user!');
    }
});

app.get('/protected', function(req, res) {
    res.send('Viewing protected route!');
});

app.listen(4000, function() {
    console.log('App listening on port 4000...');
});
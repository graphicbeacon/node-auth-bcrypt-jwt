var bcrypt = require('bcrypt');
var express = require('express');
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');

// Project files
var auth = require('./server/lib/auth.service');


// ----------------------------
// Config
// ----------------------------
var globalSecret = 'simple secret'; // TODO: Dynamically generate secret key


// ----------------------------
// Database setup
// ----------------------------
var salt = bcrypt.genSaltSync(10);
var userDatabase = [{
    user: 'admin',
    pass: bcrypt.hashSync('superman', salt)
}];
var app = express(); // Start Express instance


// ----------------------------
// Middleware settings
// ----------------------------
app.set('views', __dirname + '/server/views');
app.set('view engine', 'pug');
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
}))
app.use(function(err, req, res, next) {
    if(err.name === 'UnauthorizedError') { // Handles JWT error response
        res.status(401).redirect('/login');
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
    database: userDatabase,
    redirectTo: '/protected',
    secret: globalSecret
}));

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


// ----------------------------
// App start
// ----------------------------
app.listen(4000, function() {
    console.log('App listening on port 4000...');
});
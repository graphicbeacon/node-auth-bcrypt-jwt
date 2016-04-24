var bcrypt = require('bcrypt');
var express = require('express');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');


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
    res.render('login', {viewTitle: 'Login', content: 'This is the /login view.'});
});

app.get('/protected', function(req, res) {
    res.render('protected', {viewTitle: 'Protected', content: 'This view is protected.'});
});

app.get('/logout', function(req, res) {
    // Remove auth cookie and redirect to login again
    res.clearCookie('auth');
    res.status(302).redirect('/login'); 
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
        
        // Put signed token in cookie to be used in subsequent requests
        res.cookie('auth', responseToken);
        res.status(200).redirect('/protected');
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


// ----------------------------
// App start
// ----------------------------
app.listen(4000, function() {
    console.log('App listening on port 4000...');
});
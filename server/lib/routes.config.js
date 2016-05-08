module.exports.init = function(options) {
    var app = options.app,
        auth = options.auth;

    app.get('/', function(req, res) {
        res.render('index', {viewTitle: 'Hello World', content: 'Hello World'});
    });

    app.get('/login', function(req, res) {
        res.render('login', {viewTitle: 'Login', content: 'Please login'});
    });

    app.get('/signup', function(req, res) {
        res.render('signup', {viewTitle: 'Signup', content: 'Sign up'});
    });

    app.get('/protected', function(req, res) {
        res.render('protected', {viewTitle: 'Protected', content: 'User Dashboard'});
    });

    app.get('/logout', auth.logout);

    app.post('/login', auth.login({
        redirectTo: '/protected'
    }));

    app.post('/signup', auth.signup);
    
    app.get('/activate/:hash', auth.activate);
}
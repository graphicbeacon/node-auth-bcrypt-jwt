module.exports.init = function(config) {
    var app = config.app,
        auth = config.auth,
        store = config.store,
        secret = config.secret;
        
    app.get('/', function(req, res) {
        res.render('index', {viewTitle: 'Hello World', content: 'Hello World'});
    });

    app.get('/login', function(req, res) {
        // TODO: Redirect to protected screen if already logged in
        res.render('login', {viewTitle: 'Login', content: 'Please login'});
    });

    app.get('/signup', function(req, res) {
        // TODO: Redirect to protected screen if already logged in
        res.render('signup', {viewTitle: 'Signup', content: 'Sign up'});
    });

    app.get('/protected', function(req, res) {
        res.render('protected', {viewTitle: 'Protected', content: 'User Dashboard'});
    });

    app.get('/logout', function(req, res) {
        // TODO: check that referrer and origin are the same domain to prevent cross site attacks
        // TODO: Implement logout implementation in auth service?
        // Remove auth cookie and redirect to login again
        res.clearCookie('auth');
        res.status(302).redirect('/login'); 
    });

    app.post('/login', auth.login({
        redirectTo: '/protected',
        secret: secret,
        store: store
    }));

    app.post('/signup', auth.signup({
        store: store
    }));
}
module.exports.init = function(options) {
    var app = options.app,
        auth = options.auth,
        config = options.config;

    app.get('/', function(req, res) {
        res.render('index', {viewTitle: 'Hello World', content: 'Hello World'});
    });

    app.get('/login', function(req, res) {
        res.render('login', {viewTitle: 'Login', content: 'Please login'});
    });

    app.get('/signup', function(req, res) {
        res.render('signup', {viewTitle: 'Signup', content: 'Sign up'});
    });

    app.get(config.adminPath, function(req, res) {
        res.render('dashboard', {viewTitle: 'Dashboard', content: 'User Dashboard'});
    });
    
    app.get('/profile', function(req, res) {
        res.render('profile', {viewTitle: 'Profile', content: 'Profile of ' + req.user.user})
    });
    
    app.post('/profile', auth.updateUser);

    app.get('/logout', auth.logout);

    app.post('/login', auth.login);

    app.post('/signup', auth.signup);
    
    app.get('/activate/:hash', auth.activate);
}
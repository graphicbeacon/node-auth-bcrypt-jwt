var bcrypt = require('bcrypt');
var userDatabase = [];

module.exports.init = function(config) {
    // Add default admin user
    this.addUser('admin', 'admin@localhost', 'superman');
}

module.exports.getUser = function(username, password) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var user = userDatabase.find(function(user) {
                return username === user.user && bcrypt.compareSync(password, user.pass); 
            });
            
            if(typeof user === 'object') resolve(user);
            else reject(new Error('User doesnot exist'));
        },0);
    });
}

module.exports.addUser = function(username, email, password) {
    // User and pass supplied
    var salt = bcrypt.genSaltSync(10);
    var newUser = {
        user: username,
        email: email,
        pass: bcrypt.hashSync(password, salt)
    };
    
    // Add to database list
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            userDatabase.push(newUser);
            resolve(newUser);
        },0);
    });
}

module.exports.isExistingUser = function(username) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(userDatabase.findIndex(function(user) {
                return username.toLowerCase() === user.user.toLowerCase();
            }) > -1);
        },0);
    });
}
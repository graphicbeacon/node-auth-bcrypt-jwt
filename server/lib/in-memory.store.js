var bcrypt = require('bcrypt');

var salt = bcrypt.genSaltSync(10);
var userDatabase = [{
    user: 'admin',
    pass: bcrypt.hashSync('superman', salt)
}];

module.exports.getUser = function(username, password) {
    return userDatabase.find(function(user) {
        return username === user.user && bcrypt.compareSync(password, user.pass); 
    });
}

module.exports.addUser = function(username, password) {
    // User and pass supplied
    var salt = bcrypt.genSaltSync(10);
    var newUser = {
        user: username,
        pass: bcrypt.hashSync(password, salt)
    };
    
    // Add to database list
    userDatabase.push(newUser);
}

module.exports.isExistingUser = function(username) {
    return userDatabase.findIndex(function(user) {
        return username.toLowerCase() === user.user.toLowerCase();
    }) > -1;
}
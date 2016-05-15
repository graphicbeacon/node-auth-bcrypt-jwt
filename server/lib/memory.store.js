var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var userDatabase = [], tmpUserDatabase = [];

function findConditionKeyValueMatch(database, conditions) {
    var matchIndex;
    
    for(var key in conditions) {
        matchIndex = database.findIndex(function(user) {
            return conditions[key] === user[key]; 
        });
        console.log('Match Index', matchIndex);
        if(matchIndex > -1) return true; // match found!
    }
    return false; // match not found :-(
}

module.exports.init = function(config) {
    // Add default admin user
    this.addUser({
        user: 'admin',
        email: 'admin@localhost',
        pass: bcrypt.hashSync('superman', bcrypt.genSaltSync(10)),
        activationHash: 'N/A', // Default admin account won't need activation via email
        lastModifiedDate: new Date()
    });
}

module.exports.getUser = function(username, password) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var user = userDatabase.find(function(user) {
                return username === user.user && bcrypt.compareSync(password, user.pass); 
            });
            
            if(typeof user === 'object') resolve(user);
            else reject(new Error('User does not exist'));
        },0);
    });
}

module.exports.getTmpUser = function(activationHash) {
    return new Promise(function() {
        setTimeout(function() {
            var tmpUser = tmpUserDatabase.find(function(user) {
                return user.activationHash === activationHash; 
            });
            
            if(typeof tmpUser === 'object') resolve(tmpUser);
            else reject(new Error('TempUser does not exist.'));
        },0);
    });
}

module.exports.addUser = function(user) {
    // User and pass supplied
    var newUser = {
        user: user.user,
        email: user.email,
        pass: user.pass,
        activationHash: user.activationHash,
        lastModifiedDate: user.lastModifiedDate
    };
    
    // Add to database list
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            userDatabase.push(newUser);
            resolve(newUser);
        },0);
    });
}

module.exports.addTmpUser = function(username, email, password) {
    // User and pass supplied
    var tmpUser = {
        user: username,
        email: email,
        pass: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        activationHash: uuid.v4(),
        lastModifiedDate: new Date()
    };
    // Add to database list
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            tmpUserDatabase.push(tmpUser);
            resolve(tmpUser);
        },0);
    });
}

module.exports.removeTmpUser = function(username, email) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            var tmpUserIndex = tmpUserDatabase.findIndex(function(tmpUser) {
                return tmpUser.user === username || tmpUser.email === email; 
            });
            tmpUserDatabase.splice(tmpUserIndex, 1);
            resolve();
        },0);
    });
}

module.exports.isExistingUser = function(conditions) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            console.log('Result', findConditionKeyValueMatch(userDatabase, conditions));
            resolve(findConditionKeyValueMatch(userDatabase, conditions));
        },0);
    });
}

module.exports.isExistingTmpUser = function(conditions) {
    return new Promise(function(resolve, reject) {
        setTimeout(function() {
            resolve(findConditionKeyValueMatch(tmpUserDatabase, conditions));
        },0);
    });
}
var bcrypt = require('bcrypt');
var MongoClient = require('mongodb').MongoClient;
var DB, collectionName = 'users';

module.exports.init = function(config) {
    
    // Set up database connection
    MongoClient.connect(config.mongoUrl, function(err, db) {
        console.log('[Mongodb]: Database ready');
        
        // Initiate database
        DB = db.collection(collectionName);
        
        // Create admin user if non existent
        this.isExistingUser('admin')
            .then(function(isExistingUser) {
                if(!isExistingUser) {
                    this.addUser('admin', 'superman');
                }
            }.bind(this));
    }.bind(this));
    
}

module.exports.getUser = function(username, password) {
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.find({user: username})
        .limit(1)
        .next(function(err, user) {
            if(err) reject(err);
            else if(!user) reject('Wrong username or password.')
            else if(bcrypt.compareSync(password, user.pass)) resolve(user);
            else reject('Wrong username or password.');
        });
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
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.insertOne(newUser, function(err, savedUser) {
            if(err) reject(err);
            else resolve(!!savedUser); // User creation success
        });
    });
}

module.exports.isExistingUser = function(username) {
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.find({user: username})
        .limit(1)
        .next(function(err, user) {
            if(err) reject(err)
            else resolve(!!user);  
        });
    });
}
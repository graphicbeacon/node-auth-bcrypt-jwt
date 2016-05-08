var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var MongoClient = require('mongodb').MongoClient;
var DB, collectionName = 'users', tmpCollectionName = 'tmpusers';

module.exports.init = function(config) {
    
    // Set up database connection
    MongoClient.connect(config.mongoUrl, function(err, db) {
        console.log('[Mongodb]: Database ready');
        
        // Initiate database
        DB = {
            users: db.collection(collectionName),
            tmpUsers: db.collection(tmpCollectionName)
        };
        
        // Set expiry on tmp users
        DB.tmpUsers.createIndex({ "lastModifiedDate": 1 }, { expireAfterSeconds: config.tmpUserExpiry });
        
        // Create admin user if non existent
        this.isExistingUser('admin')
            .then(function(isExistingUser) {
                if(!isExistingUser) {
                    this.addUser('admin', 'admin@localhost', 'superman');
                }
            }.bind(this));
    }.bind(this));
    
}

module.exports.getUser = function(username, password) {
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.users
        .find({user: username})
        .limit(1)
        .next(function(err, user) {
            if(err) reject(err);
            else if(!user) reject('Wrong username or password.')
            else if(bcrypt.compareSync(password, user.pass)) resolve(user);
            else reject('Wrong username or password.');
        });
    });
}

module.exports.getTmpUser = function(hash) {
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.tmpUsers
        .find({activationHash: hash})
        .limit(1)
        .next(function(err, tmpUser) {
            if(err) reject(err);
            else resolve(tmpUser);
        });
    });
}

module.exports.addUser = function(username, email, password) {
    // User and pass supplied
    var newUser = {
        user: username,
        email: email,
        pass: password
    };
    // Add to database list
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.users.insertOne(newUser, function(err, savedUser) {
            if(err) reject(err);
            else resolve(!!savedUser); // User creation success
        });
    });
}

module.exports.addTmpUser = function(username, email, password) {
    // User and pass supplied
    var salt = bcrypt.genSaltSync(10);
    var tmpUser = {
        user: username,
        email: email,
        pass: bcrypt.hashSync(password, salt),
        activationHash: uuid.v4(),
        lastModifiedDate: new Date()
    };
    // Add to database list
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.tmpUsers.insertOne(tmpUser, function(err, savedTmpUser) {
            console.log(savedTmpUser.ops[0])
            if(err) reject(err);
            else resolve(savedTmpUser.ops[0].activationHash); // Temporary user creation success
        });
    });
}

module.exports.isExistingUser = function(username, email) {
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.users
        .find({ 
            $or: [{user: username}, {email: email}]
        })
        .limit(1)
        .next(function(err, user) {
            if(err) reject(err)
            else resolve(!!user);  
        });
    });
}

module.exports.isExistingTmpUser = function(username, email) {
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.tmpUsers
        .find({ 
            $or: [{user: username}, {email: email}]
        })
        .limit(1)
        .next(function(err, tmpUser) {
            if(err) reject(err)
            else resolve(!!tmpUser);  
        });
    });
}
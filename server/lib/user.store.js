var bcrypt = require('bcrypt');
var uuid = require('node-uuid');
var MongoClient = require('mongodb').MongoClient;
var DB, collectionName = 'users', tmpCollectionName = 'tmpusers';

function splitObjIntoArray(obj) { // Splits each key:value pair into array item, i.e., [{key: value}, {key: value}]
    var arr = [];
    
    for(var key in obj) {
        var arrItem = {};
        arrItem[key] = obj[key];
        arr.push(arrItem);        
    }
    
    return arr;
}

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
        this.isExistingUser({user: 'admin'})
            .then(function(isExistingUser) {
                if(!isExistingUser) {
                    this.addUser({
                        user: 'admin',
                        email: 'admin@localhost',
                        pass: bcrypt.hashSync('superman', bcrypt.genSaltSync(10)),
                        activationHash: 'N/A', // Default admin account won't need activation via email
                        lastModifiedDate: new Date()
                    });
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

module.exports.addUser = function(user) {
    // User and pass supplied
    var newUser = {
        user: user.user,
        fname: firstname,
        lname: lastname,
        email: user.email,
        pass: user.pass,
        activationHash: user.activationHash,
        lastModifiedDate: user.lastModifiedDate
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

module.exports.updateUser = function(userId, updatedInfo) {
    // TODO Define interface for info like other methods
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.users.updateOne({_id: userId}, updatedInfo, function(err, updatedUser) {
            if(err) reject(err);
            else resolve(!!savedUser); // User update success
        });
    });
}

module.exports.addTmpUser = function(username, firstname, lastname, email, password) {
    // User and pass supplied
    var tmpUser = {
        user: username,
        fname: firstname,
        lname: lastname,
        email: email,
        pass: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
        activationHash: uuid.v4(),
        lastModifiedDate: new Date()
    };
    // Add to database list
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.tmpUsers.insertOne(tmpUser, function(err, savedTmpUser) {
            // console.log(savedTmpUser.ops[0])
            if(err) reject(err);
            else resolve(savedTmpUser.ops[0].activationHash); // Temporary user creation success
        });
    });
}

module.exports.removeTmpUser = function(username, email) {
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
        
        DB.tmpUsers.deleteOne({user: username, email: email}, null, resolve);
    });
}

module.exports.isExistingUser = function(conditions) {
    return new Promise(function(resolve, reject) {
        if(!DB) reject() // Database not connected
       
        // Creates array for each object key:value pair 
        // for mongodb filtering operation
        var conditionsArray = splitObjIntoArray(conditions);
        
        DB.users
        .find({$or: conditionsArray})
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
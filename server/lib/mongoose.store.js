var bcrypt = require('bcrypt');
var mongoose = require('mongoose');
var userSchema, User, userItem;

module.exports.init = function(config) {
    var Schema = mongoose.Schema,
        ObjectId = Schema.ObjectId,
        db = mongoose.connection;
    
    // Set schema interface and model
    userSchema = new Schema({
        id: ObjectId,
        user: {type: String, required: true},
        pass: {type: String, required: true}
    });
    
    userSchema.set('collection', 'users');
    
    User = mongoose.model('User', userSchema);
    
    // Set up database connection
    mongoose.connect(config.mongoUrl);
    
    db.once('open', function() {
        console.log('[Mongodb]: Database ready');
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
        User.findOne({name: username}, function(err, user) {
            console.log('[Queried user]:',user);
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
    var newUser = new User({
        user: username,
        pass: bcrypt.hashSync(password, salt)
    });
    // Add to database list
    return newUser.save(function(err, savedUser) {
        if(err) return err;
        else return true; // User creation success
    });
}

module.exports.isExistingUser = function(username) {
    return new Promise(function(resolve, reject) {
        User.count({user: username}, function(err, count) {
            if(err) reject(err);
            else resolve(count > 0);
        });
    });
}
var uuid = require('node-uuid');

module.exports = {
    title: 'Brand',
    authCookie: 'auth',
    port: process.env.PORT || 4000,
    secret: uuid.v4(), // Generate RFC4122 unique identifier
    mongoUrl: 'mongodb://localhost/test',
    paths: {
        tokenWhitelist: ['/', '/login', '/signup'],
        loginBlacklist: ['/login', '/signup']
    }
}

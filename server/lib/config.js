var uuid = require('node-uuid');

module.exports = {
    title: 'Brand',
    authCookie: 'auth',
    port: process.env.PORT || 4000,
    secret: 'f0217cbe-88e8-4fe7-9c2d-3799fcf87c67',
    mongoUrl: 'mongodb://localhost/test',
    smtpApiToken: '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',
    tmpUserExpiry: 60 * 60 * 24, // 1 day
    adminPath: '/dashboard',
    paths: {
        tokenWhitelist: ['/', '/login', '/signup', /^\/activate\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i],
        loginBlacklist: ['/login', '/signup']
    }
}

var bcrypt = require('bcrypt');
var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');
var expressJwt = require('express-jwt');

// Start Express instance
var app = express();

app.get('/', function(req, res) {
    res.send('Hello World');
});

app.listen(4000, function() {
    console.log('App listening on port 4000...');
});
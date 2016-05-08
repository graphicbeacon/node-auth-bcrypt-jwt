var sendgrid = require('sendgrid');
var emailTransport;

module.exports.init = function(config) {
    emailTransport = sendgrid(config.smtpApiToken);
}

module.exports.sendActivationLink = function(recipient) {
    var message = new emailTransport.Email({
        to: recipient.email,
        toname: [recipient.username],
        from: 'localhost',
        fromname: 'noreply@localhost',
        subject: 'Welcome to Brand App! Confirm your email',
        html: '<h2 align="center">Brand App</h2> \
            <p align="center">You\'re almost there! Let\'s confirm your email address.</p>\
            <p align="center"><a href="http://localhost:4000/activate/' + recipient.activationHash + '">Confirm email address</a></p>' 
            // TODO: Use email templates to generate email with activation link
            // TODO Dynamically generate url from request object i.e, req.host, req.protocol etc...
    });
    
    return new Promise(function(resolve, reject) {
        emailTransport.send(message, function(err, json) {
            if(err) {
                console.log('Email error', err); 
                reject(err);
            } else {
                console.log('Successfully sent email', json); 
                resolve(json);
            }
        });
    });
}
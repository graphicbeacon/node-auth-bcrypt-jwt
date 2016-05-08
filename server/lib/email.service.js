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
        html: '<p>Hello world</p>' // TODO: Use email templates to generate email with activation link
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
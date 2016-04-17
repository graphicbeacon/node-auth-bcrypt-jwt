# node-auth-bcrypt-jwt

An experimental project exploring NodeJS authentication with bcrypt hashing and json web tokens. This is still on-going.

**Please Note:** This application currently does not have an associated UI, so you will have to access the endpoints using a REST Client like [Chrome's Postman plugin].

To run, simply follow the below instructions:
* Run `npm install` to update local dependencies
* Run `node index` to start localhost server on port 4000

To access `/protected` route, you need to generate a jwt by **POST**ing to `/login`. User details/params to send during this post are as follows:
```
username = 'admin'
password = 'superman'
```
This should return a token response like this:
```
{ token: '{token}' }
```
You will then need to pass this token in your 'Authorization' header sending a `GET` request to `/protected`
```
Authorization = 'Bearer {token}'
```
This will returning a 200 response with "Viewing protected route!" as the content, demonstrating that your jwt was successfully verified. If not verified an "UnauthorizedError" type response will be returned.

[//]: # (Tagged Urls)
[Chrome's Postman plugin]: https://chrome.google.com/webstore/detail/postman-rest-client-short/mkhojklkhkdaghjjfdnphfphiaiohkef/related?hl=en
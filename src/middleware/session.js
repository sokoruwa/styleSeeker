const session = require('express-session');
const config = require('../config');

function sessionMiddleware() {
    return session({
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        }
    });
}

module.exports = sessionMiddleware;

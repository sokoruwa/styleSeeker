const session = require('express-session');
const MongoStore = require('connect-mongo');
const config = require('../config');

function sessionMiddleware() {
    const options = {
        name: config.sessionName,
        secret: config.sessionSecret,
        resave: false,
        saveUninitialized: false,
        rolling: true,
        proxy: config.trustProxy,
        cookie: {
            httpOnly: true,
            secure: config.isProduction,
            sameSite: 'lax',
            maxAge: config.sessionMaxAgeMs
        }
    };

    if (config.isProduction) {
        options.store = MongoStore.create({
            mongoUrl: config.mongoUri,
            collectionName: 'sessions',
            ttl: Math.ceil(config.sessionMaxAgeMs / 1000)
        });
    }

    return session({
        ...options
    });
}

module.exports = sessionMiddleware;

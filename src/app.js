const express = require('express');
const cors = require('cors');
const config = require('./config');
const errorHandler = require('./middleware/errorHandler');
const requestLogger = require('./middleware/logging');
const sessionMiddleware = require('./middleware/session');
const routes = require('./routes');

function createApp() {
    const app = express();

    app.use(express.urlencoded({ extended: true }));
    app.use(express.json());
    app.use(sessionMiddleware());
    app.use(cors({
        origin: config.corsOrigin,
        credentials: true
    }));
    app.use(requestLogger);

    app.use(routes);

    app.use('/js', (req, res, next) => {
        res.type('application/javascript');
        next();
    }, express.static(`${config.publicDir}/js`));

    app.use(express.static(config.publicDir));
    app.use(errorHandler);

    return app;
}

module.exports = createApp;

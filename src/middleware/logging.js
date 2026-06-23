function requestLogger(req, res, next) {
    if (process.env.NODE_ENV !== 'test') {
        console.log('Incoming request:', req.method, req.path);
    }
    next();
}

module.exports = requestLogger;

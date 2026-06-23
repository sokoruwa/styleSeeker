function requestLogger(req, res, next) {
    console.log('Incoming request:', req.method, req.path);
    console.log('Session ID:', req.sessionID);
    console.log('Session data:', req.session);
    next();
}

module.exports = requestLogger;

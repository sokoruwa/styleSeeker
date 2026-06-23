function errorHandler(error, req, res, next) {
    console.error(error.stack);
    res.status(500).json({ success: false, message: 'An error occurred on the server' });
}

module.exports = errorHandler;

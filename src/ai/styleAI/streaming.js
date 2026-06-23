const { FALLBACK_TEXT } = require('./constants');

class ProviderTimeoutError extends Error {
    constructor(message) {
        super(message);
        this.name = 'ProviderTimeoutError';
    }
}

function withTimeout(promise, timeoutMs, message) {
    let timeout;
    const timeoutPromise = new Promise((resolve, reject) => {
        timeout = setTimeout(() => reject(new ProviderTimeoutError(message)), timeoutMs);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeout));
}

function writeSse(res, payload) {
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

function writeFallback(res) {
    writeSse(res, { type: 'text', text: FALLBACK_TEXT });
    writeSse(res, { type: 'done' });
}

module.exports = {
    ProviderTimeoutError,
    withTimeout,
    writeFallback,
    writeSse
};

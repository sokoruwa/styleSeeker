let cachedFetch = globalThis.fetch;

function getFetch() {
    if (!cachedFetch) {
        cachedFetch = require('node-fetch');
        globalThis.fetch = cachedFetch;
    }

    return cachedFetch;
}

module.exports = getFetch;

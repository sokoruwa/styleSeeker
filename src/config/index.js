const path = require('path');

const ROOT_DIR = path.join(__dirname, '../..');
const isProduction = process.env.NODE_ENV === 'production';

function requireEnv(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`${name} is required`);
    }

    return value;
}

module.exports = {
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction,
    port: process.env.PORT || 4000,
    rootDir: ROOT_DIR,
    publicDir: path.join(ROOT_DIR, 'public'),
    mongoUri: requireEnv('MONGODB_URI'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
    sessionSecret: requireEnv('SESSION_SECRET'),
    sessionName: process.env.SESSION_NAME || 'thriftAssist.sid',
    sessionMaxAgeMs: Number(process.env.SESSION_MAX_AGE_MS) || 24 * 60 * 60 * 1000,
    trustProxy: isProduction || process.env.TRUST_PROXY === 'true',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    ebayClientId: process.env.EBAY_CLIENT_ID,
    ebayClientSecret: process.env.EBAY_CLIENT_SECRET
};

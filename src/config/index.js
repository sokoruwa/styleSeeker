const path = require('path');

const ROOT_DIR = path.join(__dirname, '../..');

module.exports = {
    port: process.env.PORT || 4000,
    rootDir: ROOT_DIR,
    publicDir: path.join(ROOT_DIR, 'public'),
    mongoUri: process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/styleSeeker',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:4000',
    sessionSecret: process.env.SESSION_SECRET || 'your-secret-key',
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    ebayClientId: process.env.EBAY_CLIENT_ID,
    ebayClientSecret: process.env.EBAY_CLIENT_SECRET
};

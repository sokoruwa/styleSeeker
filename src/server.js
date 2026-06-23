require('dotenv').config();

const config = require('./config');
const createApp = require('./app');
const { connectMongoose } = require('./db/mongoose');

async function startServer() {
    await connectMongoose();

    const app = createApp();

    app.listen(config.port, () => {
        console.log(`Server running on port ${config.port}`);
    });
}

startServer();

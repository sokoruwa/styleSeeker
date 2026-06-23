const mongoose = require('mongoose');
const config = require('../config');

async function connectMongoose() {
    try {
        await mongoose.connect(config.mongoUri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        console.log('Successfully connected to MongoDB.');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
}

mongoose.connection.on('error', error => {
    console.error('MongoDB connection error:', error);
});

mongoose.connection.once('open', () => {
    console.log('MongoDB connection is open');
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

module.exports = {
    connectMongoose
};

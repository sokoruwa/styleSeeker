const { MongoClient } = require('mongodb');
const config = require('../config');

const client = new MongoClient(config.mongoClientUri);

async function connectMongoClient() {
    try {
        await client.connect();
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
}

function getDatabase() {
    return client.db(config.databaseName);
}

module.exports = {
    client,
    connectMongoClient,
    getDatabase
};

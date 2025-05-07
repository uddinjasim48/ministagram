const { CosmosClient } = require('@azure/cosmos');

const COSMOS_CONNECTION_STRING = process.env.COSMOS_CONNECTION_STRING;
const client = new CosmosClient(COSMOS_CONNECTION_STRING);

// Replace these if your DB/container names are different
const databaseId = 'jasimdb';
const containerId = 'media';

const database = client.database(databaseId);
const container = database.container(containerId);

module.exports = container;
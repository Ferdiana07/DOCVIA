const mongoose = require('mongoose');

let memoryServer;

const connectInMemoryDB = async () => {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The in-memory database is disabled in production.');
  }

  const { MongoMemoryServer } = require('mongodb-memory-server');
  const requestedPort = Number.parseInt(process.env.MONGO_MEMORY_PORT, 10);
  const instance = { dbName: 'docvia' };
  if (Number.isInteger(requestedPort) && requestedPort > 0 && requestedPort < 65536) {
    instance.port = requestedPort;
  }
  memoryServer = await MongoMemoryServer.create({ instance });
  const conn = await mongoose.connect(memoryServer.getUri('docvia'));
  console.warn('Using an ephemeral in-memory MongoDB database for local development.');
  return conn;
};

/**
 * Connect to MongoDB Atlas.
 * The connection URI comes from the .env file (MONGO_URI).
 * We exit the process if connection fails — a server without a database
 * cannot function correctly.
 */
const connectDB = async () => {
  if (process.env.USE_IN_MEMORY_DB === 'true') {
    return connectInMemoryDB();
  }

  const conn = await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${conn.connection.host}`);
  return conn;
};

const disconnectDB = async () => {
  await mongoose.disconnect();
  if (memoryServer) await memoryServer.stop();
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;

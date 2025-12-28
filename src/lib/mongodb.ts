import { MongoClient, Db } from 'mongodb';

// Read environment variables
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB;

// Validation function that runs when connection is actually needed
function validateEnv() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }
  
  if (!MONGODB_DB) {
    throw new Error('Please define the MONGODB_DB environment variable inside .env.local');
  }
}

interface GlobalMongo {
  _mongoClientPromise?: Promise<MongoClient>;
  _mongoDbPromise?: Promise<Db>;
}

declare const global: GlobalMongo & typeof globalThis;

let client: MongoClient;
let clientPromise: Promise<MongoClient>;
let dbPromise: Promise<Db>;

// Only initialize connection when variables are available
if (MONGODB_URI && MONGODB_DB) {
  if (process.env.NODE_ENV === 'development') {
    if (!global._mongoClientPromise) {
      client = new MongoClient(MONGODB_URI);
      global._mongoClientPromise = client.connect();
    }
    clientPromise = global._mongoClientPromise;

    if (!global._mongoDbPromise) {
      global._mongoDbPromise = clientPromise.then((client) => client.db(MONGODB_DB));
    }
    dbPromise = global._mongoDbPromise;
  } else {
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
    dbPromise = clientPromise.then((client) => client.db(MONGODB_DB));
  }
} else {
  // Create lazy promises that will validate and throw when accessed
  clientPromise = Promise.reject(new Error('MONGODB_URI is not defined'));
  dbPromise = Promise.reject(new Error('MONGODB_URI or MONGODB_DB is not defined'));
}

export { clientPromise };

export default dbPromise;
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

const dbPath = path.resolve('./db_data');
if (!fs.existsSync(dbPath)) {
  fs.mkdirSync(dbPath, { recursive: true });
}

async function start() {
  console.log("Starting persistent MongoDB server on port 27017...");
  try {
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: dbPath,
        storageEngine: 'wiredTiger',
        dbName: 'edu_tracker'
      }
    });
    console.log("✅ MongoDB local database server is running at: " + mongoServer.getUri());
    console.log("Data is persisted in: " + dbPath);
    
    // Keep the process alive
    process.on('SIGINT', async () => {
      console.log('Stopping database...');
      await mongoServer.stop();
      process.exit(0);
    });
  } catch (err) {
    console.error("❌ Failed to start MongoDB:", err);
    process.exit(1);
  }
}

start();

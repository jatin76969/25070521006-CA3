import mongoose from 'mongoose';

/**
 * Connects to MongoDB with clear logging and error reporting
 * Suitable for local MongoDB Community Server (can be inspected via MongoDB Compass).
 */
export async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/7sports';

  try {
    mongoose.connection.on('connected', () => {
      console.log(`[MongoDB] Connected successfully to: ${uri}`);
    });

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Disconnected from database.');
    });

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error('====================================================');
    console.error('CRITICAL: Failed to connect to MongoDB!');
    console.error(`Attempted URI: ${uri}`);
    console.error(`Error message: ${error.message}`);
    console.error('Troubleshooting:');
    console.error('1. Check if MongoDB Community Server is running:');
    console.error('   In PowerShell: Get-Service -Name MongoDB');
    console.error('   To start it: Start-Service -Name MongoDB');
    console.error('2. Open MongoDB Compass and test connection string: mongodb://127.0.0.1:27017');
    console.error('====================================================');
    // We do not exit process immediately so health endpoint can report DB status if queried
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}

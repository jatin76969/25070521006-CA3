import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function createAdmin() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/7sports';

  // Read arguments from command line or use college project defaults
  const args = process.argv.slice(2);
  const adminEmail = (args[0] || 'admin@7sports.com').toLowerCase().trim();
  const adminPassword = args[1] || 'Admin@12345';
  const adminName = args[2] || '7 Sports SuperAdmin';

  try {
    console.log(`[Admin Setup] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri);
    console.log('[Admin Setup] Connected successfully.');

    let user = await User.findOne({ email: adminEmail });

    if (user) {
      user.role = 'admin';
      user.name = adminName;
      user.password = adminPassword; // Will be hashed by pre-save hook
      await user.save();
      console.log(`[Admin Setup] Existing user '${adminEmail}' successfully updated with role: 'admin'!`);
    } else {
      user = await User.create({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        phone: '+91 98765 43210',
      });
      console.log(`[Admin Setup] Created new Administrator account successfully!`);
    }

    console.log('====================================================');
    console.log('ADMINISTRATOR CREDENTIALS:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     ${user.role}`);
    console.log('Login at: http://localhost:5173/login');
    console.log('====================================================');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Admin Setup Error]:', error);
    process.exit(1);
  }
}

createAdmin();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    await User.deleteMany({});
    console.log('🗑️ Cleared existing users');

    // Create test users
    const users = [
      {
        username: 'admin',
        email: 'admin@vimaanna.com',
        password: await bcrypt.hash('admin123', 10),
        isAdmin: true
      },
      {
        username: 'student',
        email: 'student@vimaanna.com',
        password: await bcrypt.hash('student123', 10),
        isAdmin: false
      },
      {
        username: 'testuser',
        email: 'test@vimaanna.com',
        password: await bcrypt.hash('test123', 10),
        isAdmin: false
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('✅ Created users:', createdUsers.length);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Student: student / student123');
    console.log('Test User: testuser / test123');

  } catch (error) {
    console.error('❌ Seeding error:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

seedData();
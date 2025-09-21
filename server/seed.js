const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Subject = require('./models/Subject');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Subject.deleteMany({});
    await User.deleteMany({});
    console.log('Cleared existing data');

    // Create subjects
    const subjects = [
      {
        name: 'Air Regulations',
        description: 'Civil Aviation Rules and Regulations',
        icon: '✈️'
      },
      {
        name: 'Air Navigation',
        description: 'Navigation principles and procedures',
        icon: '🧭'
      },
      {
        name: 'Meteorology',
        description: 'Weather and atmospheric conditions',
        icon: '🌤️'
      },
      {
        name: 'Technical General',
        description: 'General aviation technical knowledge',
        icon: '⚙️'
      },
      {
        name: 'Technical Specific',
        description: 'Aircraft-specific technical knowledge',
        icon: '🔧'
      },
      {
        name: 'Radio Telephony (RTR)-A',
        description: 'Radio communication procedures',
        icon: '📻'
      }
    ];

    const createdSubjects = await Subject.insertMany(subjects);
    console.log('Created subjects:', createdSubjects.length);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@vimaanna.com',
      password: hashedPassword,
      isAdmin: true
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create demo student user
    const studentPassword = await bcrypt.hash('student123', 10);
    const studentUser = new User({
      username: 'student123',
      email: 'student@vimaanna.com',
      password: studentPassword,
      isAdmin: false
    });
    await studentUser.save();
    console.log('Created student user');

    console.log('Database seeded successfully!');
    console.log('Admin credentials: admin / admin123');
    console.log('Student credentials: student123 / student123');

  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    mongoose.connection.close();
  }
};

seedData();

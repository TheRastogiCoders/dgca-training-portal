const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

const resetAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/vimaanna');
    console.log('Connected to MongoDB');

    // Delete existing admin user
    await User.deleteOne({ username: 'admin' });
    console.log('Deleted existing admin user');

    // Create new admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@vimaanna.com',
      password: hashedPassword,
      isAdmin: true
    });
    await adminUser.save();
    console.log('✅ New admin user created successfully!');
    console.log('Username: admin');
    console.log('Password: admin123');
    console.log('Email: admin@vimaanna.com');
    console.log('Is Admin: true');

  } catch (error) {
    console.error('Error resetting admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
  }
};

resetAdmin();

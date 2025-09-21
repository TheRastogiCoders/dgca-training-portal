const mongoose = require('mongoose');
require('dotenv').config();

const createIndexes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;

    // User collection indexes
    console.log('Creating User indexes...');
    await db.collection('users').createIndex({ username: 1 }, { unique: true });
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ createdAt: -1 });

    // Question collection indexes
    console.log('Creating Question indexes...');
    await db.collection('questions').createIndex({ subject: 1, book: 1 });
    await db.collection('questions').createIndex({ createdAt: -1 });
    await db.collection('questions').createIndex({ text: 'text' }); // Text search index
    await db.collection('questions').createIndex({ subject: 1, createdAt: -1 });

    // Result collection indexes
    console.log('Creating Result indexes...');
    await db.collection('results').createIndex({ user: 1, createdAt: -1 });
    await db.collection('results').createIndex({ testType: 1, createdAt: -1 });
    await db.collection('results').createIndex({ subject: 1, createdAt: -1 });
    await db.collection('results').createIndex({ user: 1, testType: 1 });
    await db.collection('results').createIndex({ score: 1, total: 1 });

    // Subject collection indexes
    console.log('Creating Subject indexes...');
    await db.collection('subjects').createIndex({ name: 1 }, { unique: true });
    await db.collection('subjects').createIndex({ slug: 1 }, { unique: true });

    // Book collection indexes
    console.log('Creating Book indexes...');
    await db.collection('books').createIndex({ subject: 1, title: 1 });
    await db.collection('books').createIndex({ title: 1 });
    await db.collection('books').createIndex({ subject: 1, createdAt: -1 });

    // Log collection indexes
    console.log('Creating Log indexes...');
    await db.collection('logs').createIndex({ createdAt: -1 });
    await db.collection('logs').createIndex({ method: 1, url: 1 });
    await db.collection('logs').createIndex({ userId: 1, createdAt: -1 });
    await db.collection('logs').createIndex({ ip: 1, createdAt: -1 });
    await db.collection('logs').createIndex({ status: 1, createdAt: -1 });

    // Note collection indexes
    console.log('Creating Note indexes...');
    await db.collection('notes').createIndex({ subject: 1, createdAt: -1 });
    await db.collection('notes').createIndex({ title: 'text', content: 'text' }); // Text search
    await db.collection('notes').createIndex({ createdAt: -1 });

    console.log('All indexes created successfully!');
    
    // Show index information
    const collections = ['users', 'questions', 'results', 'subjects', 'books', 'logs', 'notes'];
    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`\n${collectionName} indexes:`);
      indexes.forEach(index => {
        console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
      });
    }

  } catch (error) {
    console.error('Error creating indexes:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run if called directly
if (require.main === module) {
  createIndexes();
}

module.exports = createIndexes;

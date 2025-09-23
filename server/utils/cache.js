const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    const redisUrl = process.env.REDIS_URL; // Only use when explicitly provided
    if (!redisUrl) {
      console.log('Redis disabled: no REDIS_URL configured. Continuing without cache.');
      this.isConnected = false;
      return;
    }

    try {
      this.client = redis.createClient({
        url: redisUrl,
      });

      this.client.on('error', (err) => {
        console.log('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      this.client.on('ready', () => {
        console.log('Redis Client Ready');
        this.isConnected = true;
      });

      await this.client.connect();
    } catch (error) {
      console.log('Redis connection failed, continuing without cache:', error.message);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected || !this.client) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  async flush() {
    if (!this.isConnected || !this.client) return false;
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error('Cache flush error:', error);
      return false;
    }
  }

  // Cache key generators
  static generateKey(prefix, ...params) {
    return `${prefix}:${params.join(':')}`;
  }

  // Common cache keys
  static KEYS = {
    USER: (id) => `user:${id}`,
    QUESTIONS: (page, limit, filters) => `questions:${page}:${limit}:${JSON.stringify(filters)}`,
    RESULTS: (userId) => `results:${userId}`,
    SUBJECTS: () => 'subjects:all',
    BOOKS: (subjectId) => `books:${subjectId}`,
    STATS: (type) => `stats:${type}`
  };
}

// Singleton instance
const cacheService = new CacheService();

module.exports = cacheService;

const cacheService = require('../utils/cache');

/**
 * Cache middleware factory
 * @param {number} ttl - Time to live in seconds
 * @param {function} keyGenerator - Function to generate cache key from request
 * @param {boolean} skipCache - Function to determine if cache should be skipped
 */
const cache = (ttl = 300, keyGenerator = null, skipCache = null) => {
  return async (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Skip caching if skipCache function returns true
    if (skipCache && skipCache(req)) {
      return next();
    }

    try {
      // Generate cache key
      let cacheKey;
      if (keyGenerator) {
        cacheKey = keyGenerator(req);
      } else {
        // Default key generation
        const baseKey = `${req.originalUrl}`;
        const queryString = Object.keys(req.query).length > 0 
          ? `:${JSON.stringify(req.query)}` 
          : '';
        cacheKey = `${baseKey}${queryString}`;
      }

      // Try to get from cache
      const cachedData = await cacheService.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return res.json(cachedData);
      }

      // Cache miss - store original res.json
      const originalJson = res.json;
      res.json = function(data) {
        // Cache the response
        cacheService.set(cacheKey, data, ttl).catch(err => {
          console.error('Failed to cache response:', err);
        });
        
        // Call original json method
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
};

/**
 * Cache invalidation middleware
 * @param {string|function} pattern - Cache key pattern or function to generate pattern
 */
const invalidateCache = (pattern) => {
  return async (req, res, next) => {
    const originalJson = res.json;
    
    res.json = function(data) {
      // Invalidate cache after successful response
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const invalidatePattern = typeof pattern === 'function' ? pattern(req) : pattern;
        
        // For now, we'll use a simple approach
        // In production, you might want to use Redis SCAN or maintain a cache key registry
        if (invalidatePattern) {
          cacheService.del(invalidatePattern).catch(err => {
            console.error('Failed to invalidate cache:', err);
          });
        }
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = {
  cache,
  invalidateCache
};

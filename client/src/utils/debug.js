// Centralized logger to avoid leaking sensitive data in production
export const debugLog = (...args) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

export default debugLog;


const validateEnvironment = () => {
  const usingMemoryDB = process.env.USE_IN_MEMORY_DB === 'true';
  const required = usingMemoryDB ? ['JWT_SECRET'] : ['MONGO_URI', 'JWT_SECRET'];
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) {
    throw new Error(`Missing required environment variable(s): ${missing.join(', ')}`);
  }

  if (process.env.NODE_ENV === 'production' && usingMemoryDB) {
    throw new Error('USE_IN_MEMORY_DB cannot be enabled in production.');
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must contain at least 32 characters in production.');
  }
};

module.exports = { validateEnvironment };

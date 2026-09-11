export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',

  port: parseInt(process.env.PORT || '3000', 10),

  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5433', 10),
    name: process.env.DATABASE_NAME || 'fraud_platform',
    username: process.env.DATABASE_USER || 'fraud_user',
    password: process.env.DATABASE_PASSWORD || '',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
  },

  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  },
});

// Database configuration
export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'postgres',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    name: process.env.DB_NAME || 'happy_harvest',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://redis:6379'
  },
  telegram: {
    botToken: process.env.TG_BOT_TOKEN || '',
    appName: process.env.TG_APP_NAME || ''
  },
  stars: {
    apiKey: process.env.STAR_API_KEY || '',
    usdRate: 0.013 // 1 star ≈ $0.013
  }
};

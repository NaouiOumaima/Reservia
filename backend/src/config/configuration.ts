// src/config/configuration.ts

export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),

  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/bookinghub',
  },

  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'superSecretKey123!',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'superRefreshKey123!',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  },

  reservation: {
    pendingTimeoutMinutes: parseInt(process.env.RESERVATION_PENDING_TIMEOUT || '10', 10),
    reminderHours: parseInt(process.env.RESERVATION_REMINDER_HOURS || '2', 10),
  },

  mapbox: {
    token: process.env.MAPBOX_TOKEN,
  },

  dialogflow: {
    projectId: process.env.DIALOGFLOW_PROJECT_ID,
  },

  assemblyai: {
    apiKey: process.env.ASSEMBLYAI_API_KEY,
  },

  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
  },

  email: {
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
});
// src/modules/ai/ai.config.ts
export default () => ({
  ai: {
    assemblyaiApiKey: process.env.ASSEMBLYAI_API_KEY || '',
    openaiApiKey: process.env.OPENAI_API_KEY || '',
    googleCloudApiKey: process.env.GOOGLE_CLOUD_API_KEY || '',
    rateLimit: {
      maxRequests: 10,
      windowMs: 60000,
    },
    cache: {
      ttl: 300000,
    },
    supportedLanguages: ['fr', 'en', 'ar'],
    defaultLanguage: 'fr',
  },
});
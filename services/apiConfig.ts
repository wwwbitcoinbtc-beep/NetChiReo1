// Frontend environment configuration for API

const ENV = process.env.NODE_ENV || 'development';

const config = {
  development: {
    API_BASE_URL: 'https://localhost:5001/api/v1',
    SIGNALR_URL: 'https://localhost:5001/hubs',
    TIMEOUT: 30000,
  },
  production: {
    API_BASE_URL: 'https://api.netchidomain.com/api/v1',
    SIGNALR_URL: 'https://api.netchidomain.com/hubs',
    TIMEOUT: 30000,
  },
};

export const API_CONFIG = config[ENV as keyof typeof config];

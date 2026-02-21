// Frontend environment configuration for API

const ENV = process.env.NODE_ENV || 'development';

// Use Vite environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5232';

const config = {
  development: {
    API_BASE_URL: `${API_URL}/api/v1`,
    SIGNALR_URL: `${API_URL}/hubs`,
    TIMEOUT: 30000,
  },
  production: {
    API_BASE_URL: `${API_URL}/api/v1`,
    SIGNALR_URL: `${API_URL}/hubs`,
    TIMEOUT: 30000,
  },
};

export const API_CONFIG = config[ENV as keyof typeof config];

console.log('🔌 API Config:', API_CONFIG);

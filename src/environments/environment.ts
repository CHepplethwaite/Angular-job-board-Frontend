export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api/users', // Updated to match Django URL structure
  wsUrl: 'ws://localhost:8000/ws',
  tokenRefreshInterval: 300000, // 5 minutes
  appName: 'Zizo',
  version: '1.0.0',
  debug: true
};
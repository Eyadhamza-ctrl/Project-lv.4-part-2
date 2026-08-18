export default {
  testEnvironment: 'node',
  transform: {},
  moduleNameMapper: {},
  setupFilesAfterEnv: ['./tests/setup.js'],
  testTimeout: 30000,
  verbose: true,
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/config/swagger.js'
  ]
};

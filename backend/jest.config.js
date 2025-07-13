export default {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/test/jest/*.spec.js'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
};

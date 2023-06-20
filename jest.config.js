module.exports = {
  roots: [
    '<rootDir>'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  collectCoverageFrom: [
    './src/**/*.ts'
  ],
  coveragePathIgnorePatterns: [
    '/src/bin/',
  ],
  preset: 'ts-jest',
  verbose: true,
  testMatch: [
    '**/test/src/**/*.unit.ts',
  ],
  globals: {
    'ts-jest': {
      diagnostics: true
    }
  },
  globalSetup: './test/global.setup.ts'
}

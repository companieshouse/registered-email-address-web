module.exports = {
  roots: [
    '<rootDir>'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],
  coveragePathIgnorePatterns: [
    '/src/bin/',
  ],
  preset: 'ts-jest',
  testMatch: [
    '**/test/src/**/*.unit.ts',
  ],
  globals: {
    'ts-jest': {
      diagnostics: true
    }
  },
  globalSetup: './test/global_setup.ts'
}

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
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov'],
  testMatch: [
    '**/test/src/**/*.unit.ts',
  ],
  transform: {
    "^.+\\.[tj]sx?$": "ts-jest"
  },
  globalSetup: './test/global_setup.ts',
  transformIgnorePatterns: [
    "/node_modules/(?!.*(uuid|@companieshouse/web-security-node|chai).*)",
    "\\.pnp\\.[^\\/]+$"
  ],
};

#!/usr/bin/env node

var jestConfig = {
  transform: {
    '.(ts?)': 'ts-jest'
  },
  testMatch: ['**/?(*.)(spec|test).{t,j}s'],
  testPathIgnorePatterns: [
    '<rootDir>/(node_modules|lib|es|dist)'
  ],
  collectCoverageFrom: [
    'src/**/*.{t,j}s',
    '!src/**/*.d.ts',
  ],
  moduleFileExtensions: ['js', 'json', 'ts']
};

module.exports = jestConfig;

// If this file is run as an executable, print the config stringified to JSON
if (require.main === module) {
  console.log(JSON.stringify(jestConfig));
}

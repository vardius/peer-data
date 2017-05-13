#!/usr/bin/env node
var semver = require('semver');

function getSupportedTypescriptTarget() {
  var nodeVersion = process.versions.node;

  if (semver.gt(nodeVersion, '7.6.0')) {
    return 'es2017'
  } else if (semver.gt(nodeVersion, '7.0.0')) {
    return 'es2016';
  } else if (semver.gt(nodeVersion, '6.0.0')) {
    return 'es2015';
  } else if (semver.gt(nodeVersion, '4.0.0')) {
    return 'es5';
  } else {
    return 'es3';
  }
}

var jestConfig = {
  transform: {
    '.(tsx?)': '<rootDir>/node_modules/ts-jest/preprocessor.js'
  },
  testResultsProcessor: '<rootDir>/node_modules/ts-jest/coverageprocessor.js',
  testMatch: [
    '**/__tests__/**/*.{t,j}s?(x)',
    '**/?(*.)(spec|test).{t,j}s?(x)'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/(node_modules|lib|es|dist)'
  ],
  collectCoverageFrom: [
    'src/**/*.{t,j}s?(x)',
    '!src/**/*.d.ts',
  ],
  moduleFileExtensions: ['js', 'jsx', 'json', 'ts', 'tsx'],
  globals: {
    __TS_CONFIG__: {
      target: getSupportedTypescriptTarget(),
      module: 'commonjs',
      inlineSourceMap: true
    }
  }
};

module.exports = jestConfig;

// If this file is run as an executable, print the config stringified to JSON
if (require.main === module) {
  console.log(JSON.stringify(jestConfig));
}
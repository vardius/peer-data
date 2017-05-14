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
  testMatch: [
    '**/__tests__/**/*.{t,j}s',
    '**/?(*.)(spec|test).{t,j}s'
  ],
  testPathIgnorePatterns: [
    '<rootDir>/(node_modules|lib|es|dist)'
  ],
  collectCoverageFrom: [
    'src/**/*.{t,j}s',
    '!src/**/*.d.ts',
  ],
  moduleFileExtensions: ['js', 'json', 'ts'],
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
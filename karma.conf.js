var webpackConfig = require('./webpack.test');

module.exports = function (config) {
    var _config = {
        basePath: '',

        frameworks: ['jasmine'],

        files: [
            {pattern: './karma-test-shim.js', watched: false}
        ],

        preprocessors: {
            './karma-test-shim.js': ['webpack', 'sourcemap']
        },

        webpack: webpackConfig,

        webpackMiddleware: {
            stats: 'errors-only'
        },

        webpackServer: {
            noInfo: true
        },

        coverageReporter: {
            dir: 'coverage/',
            reporters: [{
                type: 'json',
                dir: 'coverage',
                subdir: 'json',
                file: 'coverage-final.json'
            }]
        },

        remapIstanbulReporter: {
            src: 'coverage/json/coverage-final.json',
            reports: {
                lcovonly: 'coverage/json/lcov.info',
                html: 'coverage/html',
                'text': null
            },
            timeoutNotCreated: 1000, // default value
            timeoutNoMoreFiles: 1000 // default value
        },

        reporters: ["mocha", "coverage", "karma-remap-istanbul"],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: false,
        browsers: ['PhantomJS'],
        singleRun: true
    };

    config.set(_config);
};

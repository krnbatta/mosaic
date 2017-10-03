module.exports = function(config) {
    config.set({

        basePath: '',
        frameworks: ['browserify', 'jasmine'],
        browsers: ['Chrome'],
        files: [
            'tests/**/*.js'
        ],
        plugins: [
          'karma-chrome-launcher',
          'karma-browserify',
          'karma-jasmine'
        ],
        exclude: [],
        preprocessors: {
            'tests/**/*.js': ['browserify']
        },

        browserify: {
            debug: true,
            transform: ['babelify']
        }
    });
};

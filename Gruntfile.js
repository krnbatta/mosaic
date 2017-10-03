module.exports = function(grunt) {
    grunt.initConfig({
        browserify: {
            development: {
                src: [
                    "./js/application.js",
                ],
                dest: './js/common.js',
                options: {
                    browserifyOptions: {
                        debug: true
                    },
                    transform: [
                        ["babelify", {
                            "presets": ["es2015"]
                        }]
                    ]
                }
            }
        },
        watch: {
            scripts: {
                files: ["./js/**/*.js"],
                tasks: ["browserify"]
            }
        }
    });
    grunt.loadNpmTasks('grunt-browserify');
    grunt.loadNpmTasks('grunt-contrib-watch');
};

module.exports = function(grunt) {

	grunt.initConfig({

        browserify: {
            dist: {
                src: 'src/main.js',
                dest: '../build/dist.js'
            }
        }

	});

    grunt.loadNpmTasks('grunt-browserify');

	grunt.registerTask('default', ['browserify:dist']);
};

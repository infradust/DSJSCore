module.exports = function(grunt) {
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		symlink: {
			options:{
				overwrite:false	
			},
			build:{
				src:'build',
				dest:'test/lib'
			},
			require:{
				src:'node_modules/grunt-contrib-requirejs/node_modules/requirejs/require.js',
				dest:'test/require.js'
			}
		},
		
	});
	grunt.loadNpmTasks('grunt-contrib-symlink');
};
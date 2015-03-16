module.exports = function(grunt) {
	grunt.initConfig({
		pkg:grunt.file.readJSON('package.json'),
		d:{
			src:'src/',
			out:'out/',
			tst:'test/',
			min:'<%= d.out %>min/',
			fmin:'DS.min.js',
			pmin:'<%= d.min %><%= d.fmin %>',
			allsrcjs: '<%= d.src %>**/*.js',
			alloutjs: '<%= d.out %>**/*.js',
			out_t: '<%= d.out %>test/',
		},
		
		watch: {
			files:['<%= d.allsrcjs %>'],
			tasks:['jshint:lib'],
		},
		
		jshint: {
			lib:['<%= d.allsrcjs %>'],
			out:['<%= d.alloutjs %>'],
		},
		
		uglify:{
			options:{
				//screwIE8      : true,
				sourceMap     : true,
				mangle        : true,
				compress:{
					sequences     : true,  // join consecutive statemets with the “comma operator”
					properties    : true,  // optimize property access: a["foo"] → a.foo
					dead_code     : true,  // discard unreachable code
					drop_debugger : true,  // discard “debugger” statements
					unsafe        : false, // some unsafe optimizations (see below)
					conditionals  : true,  // optimize if-s and conditional expressions
					comparisons   : true,  // optimize comparisons
					evaluate      : true,  // evaluate constant expressions
					booleans      : true,  // optimize boolean expressions
					loops         : true,  // optimize loops
					unused        : true,  // drop unused variables/functions
					hoist_funs    : true,  // hoist function declarations
					hoist_vars    : false, // hoist variable declarations
					if_return     : true,  // optimize if-s followed by return/continue
					join_vars     : true,  // join var declarations
					cascade       : true,  // try to cascade `right` into `left` in sequences
					side_effects  : true,  // drop side-effect-free statements
					warnings      : true,  // warn about potentially dangerous optimizations/code
					global_defs   : {},    // global definitions
				},
				//global      : ['DS'],
				wrap:true,
			},
			core:{
				files:{
					'<%= d.pmin %>':['<%= d.src %>DS.js','<%= d.src %>data.js'],
				}
			},
		},
		
		symlink: {
			options:{
				overwrite:true	
			},
			build:{
				src:'build',
				dest:'test/lib'
			},
			require:{
				src:'node_modules/grunt-contrib-requirejs/node_modules/requirejs/require.js',
				dest:'test/require.js'
			},
			dev:{
				src:'node_modules/grunt-contrib-requirejs/node_modules/requirejs/require.js',
				dest:'src/require.js'
			}
		},
		
		requirejs: {
			compile:{
				options:{
					mainConfigFile:'./src/main.js',
					dir:'./req-build',
					name:'./main',
					optimizer:'uglify2',
					//out:'o.js'
				},
			},
		},
		
		clean:{
			out :{
				src:['<%= d.out %>'],
			},
			sym:{
				src:['test/lib','test/require.js','src/require.js'],	
			},
			req:{
				src:['req-build'],
			},
		},
		
		preprocess:{
			options:{
			},
			dev:{
				options: {
					context:{
						DEBUG:false,
						TESTING:{
							TYPE:'DEV'
						},
					},
				},
				files: {
					dest:'<%= d.out_t %>index.html',
					src:'<%= d.tst %>/index.html'
				}
			},
			min:{
				options:{
					context:{
						DEBUG:false,
						TESTING:{
							TYPE:'MIN'
						},
					},
				},
				
					dest:'<%= d.out_t %>index.html',
					src:'<%= d.tst %>index.html'
				
			}
		},
		
	});
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-symlink');
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-preprocess');
	
	grunt.registerTask('minify',['jshint:lib','clean:out','uglify:core','preprocess:min']);
};
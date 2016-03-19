var gulp = require('gulp');
var compressor = require('node-minify');
var jshint = require('gulp-jshint');
var replace = require('gulp-replace');

gulp.task('build',['scripts','copy'], function () {

	new compressor.minify({
		type: 'gcc',
		fileIn: 'dist/classes.js',
		fileOut: 'dist/classes.min.js',
		options: ['--compilation_level=SIMPLE_OPTIMIZATIONS'],
	//	sync: true,
		callback: function(err, min){
			if (err)console.error("minify err",err);
		}
	});

});

gulp.task('copy', function() {
	var pack = require("./package.json");
	gulp.src(['src/**/*.js'])
		.pipe(replace('%version%', pack.version))
		.pipe(replace('%description%', pack.description))
		.pipe(replace('%name%', pack.name))
		.pipe(replace('%url%', pack.repository.url))
		.pipe(gulp.dest('dist'));

})

gulp.task('scripts', function() {

	gulp.src(['src/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default', { verbose: true }));

})


gulp.task('default', function() {
	gulp.watch('src/classes.js', function(event) {
		gulp.run('build');
	});

})
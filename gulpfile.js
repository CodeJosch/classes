var gulp = require('gulp');
var watch = require('gulp-watch');
var compressor = require('node-minify');
var jshint = require('gulp-jshint');

gulp.task('build',['scripts'], function () {

// Using Google Closure
	new compressor.minify({
		type: 'gcc',
		fileIn: 'src/classes.js',
		fileOut: 'dist/classes.min.js',
		options: ['--compilation_level=SIMPLE_OPTIMIZATIONS'],
	//	sync: true,
		callback: function(err, min){
			if (err)console.error("minify err",err);
		}
	});

});

gulp.task('scripts', function() {
	gulp.src(['src/**/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default', { verbose: true }))
		.pipe(gulp.dest('dist'));

})


gulp.task('default', function() {
	gulp.watch('src/classes.js', function(event) {
		gulp.run('build');
	});

})
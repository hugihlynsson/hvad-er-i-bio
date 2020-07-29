var gulp        = require('gulp');
var less        = require('gulp-less');
var autoprefix  = require('gulp-autoprefixer');
var minifycss   = require('gulp-minify-css');
var concat      = require('gulp-concat');
var jshint      = require('gulp-jshint');
var uglify      = require('gulp-uglify');
// var livereaload = require('gulp-livereload');
// var notify      = require('gulp-notify');

gulp.task('styles', function() {
    return gulp.src('./source/main.less')
        .pipe(less())
        .pipe(autoprefix('last 2 versions'))
        .pipe(minifycss())
        .pipe(gulp.dest('./public'))
        // .pipe(livereaload())
        // .pipe(notify('Styles task complete'));
});

gulp.task('scripts', function() {
    return gulp.src([
        './source/jquery.js',
        './source/imagesloaded.js',
        './source/fluidbox.js',
        './source/main.js'
    ])
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./public'))
        // .pipe(livereaload())
        // .pipe(notify('Scripts task completed'));
});

gulp.task('lint', function() {
    return gulp.src('./source/main.js')
        .pipe(jshint('./.jshintrc'))
        .pipe(jshint.reporter('default'));
});

// gulp.task('watch', function() {
//     gulp.watch('./source/**/*.less', ['styles']);
//     gulp.watch('./source/**/*.js', ['lint', 'scripts']);
// });

gulp.task('default', ['styles', 'scripts', 'lint']);

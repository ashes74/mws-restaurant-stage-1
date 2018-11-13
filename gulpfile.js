const gulp = require("gulp");
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
const eslint = require('gulp-eslint');
const jest = require('gulp-jest').default;
const babel = require("gulp-babel");

gulp.task('default', [
    'copy-html', 'copy-images', 'styles', 'lint'
], function () {
    gulp.watch('/sass/**/*.scss', ['styles']);
    gulp.watch('/js/**/*.js', ['lint']);
    gulp.watch('/src/index.html', ['copy-html']);
    browserSync.init({server: './dist'});
})

gulp.task('copy-html', function () {
    gulp
        .src('./src/index.html')
        .pipe(gulp.dest('./dist'))
})

gulp.task('copy-images', function () {
    gulp
        .src('./src/img/*')
        .pipe(gulp.dest('./dist/img'))
})

gulp.task('styles', function () {
    gulp
        .src('src/sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', sass.logError)
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(gulp.dest('dist/css'))
        .pipe(browserSync.stream());
});

//copied from course materials
gulp.task('lint', function () {
    return (gulp.src(['src/js/**/*.js']).pipe(babel())
    // eslint() attaches the lint output to the eslint property of the file object
    // so it can be used by other modules.
        .pipe(eslint())
    // eslint.format() outputs the lint results to the console. Alternatively use
    // eslint.formatEach() (see Docs).
        .pipe(eslint.format())
    // To have the process exit with an error code (1) on lint error, return the
    // stream and pipe to failOnError last.
        .pipe(eslint.failOnError()));
});

gulp.task('jest', function () {

    return gulp
        .src('__tests__')
        .pipe(jest({
            "verbose": true,
            "preprocessorIgnorePatterns": ["./dist/", "./node_modules/"]
        }));
});

'use strict';

import {task, watch, src, dest} from "gulp";
import sass, {logError} from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
import eslinat, {format, failOnError} from 'gulp-eslint';
import jest from 'gulp-jest';
import babel from "gulp-babel";

task('default', [
    'copy-html', 'copy-images', 'styles', 'lint'
], function () {
    watch('/sass/**/*.scss', ['styles']);
    watch('/js/**/*.js', ['lint']);
    watch('/src/index.html', ['copy-html']);
    browserSync({server: './dist'});
})

task('copy-html', function () {
    src('./src/index.html').pipe(dest('./dist'))
})

task('copy-images', function () {
    src('./src/img/*').pipe(dest('./dist/img'))
})

task('styles', function () {
    src('src/sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', logError)
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
});

//copied from course materials
task('lint', function () {
    return (src(['src/js/**/*.js'])
    // eslint() attaches the lint output to the eslint property of the file object
    // so it can be used by other modules.
        .pipe(eslint())
    // eslint.format() outputs the lint results to the console. Alternatively use
    // eslint.formatEach() (see Docs).
        .pipe(format())
    // To have the process exit with an error code (1) on lint error, return the
    // stream and pipe to failOnError last.
        .pipe(failOnError()));
});

task('jest', function () {

    return src('__tests__').pipe(jest({
        "verbose": true,
        "preprocessorIgnorePatterns": ["./dist/", "./node_modules/"]
    }));
});

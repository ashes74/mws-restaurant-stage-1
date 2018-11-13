'use strict';

import {watch, src, dest, parallel, series} from "gulp";
import sass, {logError} from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import eslint, {format, failOnError} from 'gulp-eslint';
import jest from 'gulp-jest';

const browserSync = require('browser-sync').create();

const paths = {
    js: {
        src: 'src/**/*.js',
        dest: 'dist/'
    },
    sw: {
        src: 'src/',
        dest: 'dist/'
    },
    html: {
        src: 'src/**/*.html',
        dest: 'dist/'
    }
}

export function sync() {
    browserSync.init({
        port: 3000,
        server: {
            baseDir: './dist'
        }
    });
    watch('/sass/**/*.scss', styles).on('change', browserSync.reload);
    watch('/js/**/*.js', series(lint, copyJS)).on('change', browserSync.reload);
    watch('/src/index.html', copyHtml).on('change', browserSync.reload);
}

export default parallel(copyHtml, copyImages, styles, lint, copyJS, copyData, sync)

//TODO: get data from server
function copyData() {
    return src('src/data/restaurants.json').pipe(dest('./dist/data'))
}

export function copyHtml() {
    return src(['./src/**/*.html', './src/sw.js']).pipe(dest('./dist', {overwrite: true}))
}

//TODO: minify and concatenate js
export function copyJS() {
    return src('./src/js/**/*.js').pipe(dest('./dist/js', {overwrite: true}))
}

export function copyImages() {
    return src('./src/img/*').pipe(dest('./dist/img'))
}

export function styles() {
    return src('src/sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', logError)
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

//copied from course materials
export function lint() {
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
}

export function test() {
    return src('__tests__').pipe(jest({
        "verbose": true,
        "preprocessorIgnorePatterns": ["./dist/", "./node_modules/"]
    }));
}

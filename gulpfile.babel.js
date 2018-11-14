'use strict';

import { watch, src, dest, parallel, series } from "gulp";
import _sass, { logError } from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import eslint, { format, failOnError } from 'gulp-eslint';
import jest from 'gulp-jest';
import del from 'del';

const browserSync = require('browser-sync').create();

// NB: if change file structure can update src and dest quicker as variables
const paths = {
    js: {
        src: 'src/**/*.js',
        dest: 'dist/'
    },
    sw: {
        src: 'src/sw.js',
        dest: 'dist/'
    },
    html: {
        src: 'src/**/*.html',
        dest: 'dist/'
    },
    sass: {
        src: 'src/sass/**/*.scss',
        dest: 'dist/css'
    },
    images: {
        src: 'src/img/*',
        dest: 'dist/img'
    },
    app: {
        src: 'src',
        dest: 'dist'
    }
}

export function _watch() {
    watch(paths.sass.src, {}, styles);
    watch(paths.js.src, {}, series(lint, copyJS));
    watch(paths.html.src, {}, copyHtml);
}

export function sync() {
    _watch()
    browserSync.init({
        port: 3000,
        server: {
            baseDir: './dist'
        }
    });
}

export default series(clean, parallel(copyHtml, copyImages, styles, lint, copyJS), sync)

export function copyHtml() {
    return src(paths.html.src)
        .pipe(dest(paths.html.dest, { overwrite: true }))
        .pipe(browserSync.stream({ match: "**/*.html" }))
}

//TODO: minify and concatenate js
export function copyJS() {
    return src(paths.js.src, {base:'./src'})
        .pipe(dest(paths.js.dest, { overwrite: true }))
        .pipe(browserSync.stream({ match: "**/*.js" }))
}

export function copyImages() {
    return src(paths.images.src).pipe(dest(paths.images.dest))
}

export function styles() {
    return src(paths.sass.src)
        .pipe(_sass({ outputStyle: 'compressed' }))
        .on('error', logError)
        .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
        .pipe(dest(paths.sass.dest))
        .pipe(browserSync.stream({ match: "**/*.css" }));
}

export function lint() {
    return (src([paths.js.src])
        .pipe(eslint())
        .pipe(format())
        .pipe(failOnError()))
}

export function test() {
    return src('__tests__').pipe(jest({
        "verbose": true,
        "preprocessorIgnorePatterns": ["./dist/", "./node_modules/"]
    }));
}

export function clean() {
    return del(paths.app.dest);
}

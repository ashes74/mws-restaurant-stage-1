'use strict';


import { watch, src, dest, parallel, series } from "gulp";
import _sass, { logError } from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import jest from 'gulp-jest';
import del from 'del';

const browserSync = require('browser-sync').create();
const webpack = require('webpack-stream');

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
        src: 'src/*.html',
        dest: 'dist/'
    },
    sass: {
        src: 'src/sass/*.scss',
        dest: 'dist/css'
    },
    images: {
        src: 'src/img/*',
        dest: 'dist/img'
    },
    app: {
        src: 'src/**',
        dest: 'dist/',
       
    }
}

export function _watch() {
    watch(paths.sass.src, sass);
    watch(paths.js.src, copyJS);
    watch(paths.html.src, copyHtml);
}

export function sync() {
    _watch()
    browserSync.init({
        port: 8000,
        server: {
            baseDir: './dist'
        }
    });
}

export default series(clean, parallel(copy, sass), sync)

export function copy() {
    copyJS()
    copyHtml()
    return src(paths.app.src, { base: './src', ignore: [`src/sass/**`, paths.html.src, paths.js.src ]})
    .pipe(dest(paths.app.dest))
    .pipe(browserSync.stream())
}

function copyHtml() {
    return src(paths.html.src)
    .pipe(dest(paths.html.dest))
    .pipe(browserSync.stream({ match: "**/*.html" }))
}

function copyJS() {
    return src(paths.js.src, {base: './src'})
        .pipe(webpack(require('./webpack.config.js')))
    .pipe(dest(paths.js.dest))
    .pipe(browserSync.stream({ match: "**/*.js" }))
}

export function sass() {
    return src(paths.sass.src)
        .pipe(_sass({ outputStyle: 'compressed' }))
        .on('error', logError)
        .pipe(autoprefixer({ browsers: ['last 2 versions'] }))
        .pipe(dest(paths.sass.dest))
        .pipe(browserSync.stream({ match: "**/*.css" }));
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
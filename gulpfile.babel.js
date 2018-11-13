'use strict';

import {watch, src, dest, parallel} from "gulp";
import sass, {logError} from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import browserSync from 'browser-sync';
import eslint, {format, failOnError} from 'gulp-eslint';
import jest from 'gulp-jest';


export function start() {
    const stylesWatcher = watch('/sass/**/*.scss', styles);
    const lintWatcher = watch('/js/**/*.js', lint);
    const copyHtmlWatcher = watch('/src/index.html', copyHtml);
    
    stylesWatcher.on('all',(...args)=>{
        console.log(args);
    })
    lintWatcher.on('all',(...args)=>{
        console.log(args);
    })
    copyHtmlWatcher.on('all',(...args)=>{
        console.log(args);
    })
    browserSync({
        server: './dist',
    });
}

export default parallel( copyHtml, copyImages, styles, lint, copyJS, copyData, start)

//TODO: get data from server
function copyData (){
    return src('src/data/restaurants.json').pipe(dest('./dist/data'))
}

export function copyHtml () {
   return src(['./src/**/*.html', './src/sw.js']).pipe(dest('./dist', {overwrite: true}))
}

//TODO: minify and concatenate js
export function copyJS () {
   return src('./src/js/**/*.js').pipe(dest('./dist/js', {overwrite: true}))
}

export function copyImages() {
   return src('./src/img/*').pipe(dest('./dist/img'))
}

export function styles () {
   return src('src/sass/**/*.scss')
        .pipe(sass({outputStyle: 'compressed'}))
        .on('error', logError)
        .pipe(autoprefixer({browsers: ['last 2 versions']}))
        .pipe(dest('dist/css'))
        .pipe(browserSync.stream());
}

//copied from course materials
export function lint () {
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

export function test () {
    return src('__tests__').pipe(jest({
        "verbose": true,
        "preprocessorIgnorePatterns": ["./dist/", "./node_modules/"]
    }));
}

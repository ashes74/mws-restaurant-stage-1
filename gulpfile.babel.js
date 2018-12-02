'use strict';

import gulp, { series, parallel } from 'gulp';
import responsive from 'gulp-responsive';
import del from 'del';

// Create responsive images for jpg files
export function jpgImages() {
    return gulp.src('src/images/**/*.jpg')
        .pipe(responsive({
            // Resize all jpg images to three different sizes: 300, 600 and 800
            '**/*.jpg': [{
                width: 600,
                quality: 70,
                rename: {
                    suffix: '-large'
                }
            }, {
                width: 400,
                quality: 50,
                rename: {
                    suffix: '-medium'
                }
            }, {
                width: 200,
                quality: 40,
                rename: {
                    suffix: '-small'
                }
            }]
        },))
        .pipe(gulp.dest('src/img/'));
}
;

// Just copy any other images to img folder
export function otherImages() {
    return gulp.src(['!images/**/*.jpg', 'images/**/*.*'])
        .pipe(gulp.dest('img/'));
}
;

// clean img folder
export function clean() {
    return del(['img/']);
}
;

// // Run this task for your images.
// gulp.task("images", function(done) {
//     series(
//         'clean',
//         ['jpg-images', 'other-images'],
//         done
//     );
// });

export default series(clean, parallel(jpgImages, otherImages))
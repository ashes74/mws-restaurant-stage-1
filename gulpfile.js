const gulp = require("gulp");
const sass = require('gulp-sass');

gulp.task("styles", function() {
    gulp
      .src("src/sass/**/*.scss")
      .pipe(sass())
      .on("error", sass.logError)
      .pipe(gulp.dest("dist/css"));
  });

gulp.task("default", function(){

})
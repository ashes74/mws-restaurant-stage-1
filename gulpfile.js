const gulp = require("gulp");
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

gulp.task("default", ["styles"], function(){
    gulp.watch("src/sass/**/*.scss", ["styles"]);
    browserSync.init({
        server: "./src"
      });
})

gulp.task("styles", function() {
    gulp
      .src("src/sass/**/*.scss")
      .pipe(sass())
      .on("error", sass.logError)
      .pipe(
        autoprefixer({
          browsers: ["last 2 versions"]
        })
      )
      .pipe(gulp.dest("dist/css"))
      .pipe(browserSync.stream());
  });


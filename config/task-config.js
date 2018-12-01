module.exports = {
  html: false,
  images: true,
  fonts: false,
  static: true,
  svgSprite: false,
  ghPages: false,
  stylesheets: true,

  javascripts: {
    entry: {
      // files paths are relative to javascripts.dest in path-config.json
      main: ["./main.js"],
      restaurant: ["./restaurant_info.js"]
    },
    babel: {
      presets: ["@babel/preset-env"],
      plugins: ['@babel/plugin-transform-runtime']
    }

  },

  html: {
    alternateTask: function(gulp, PATH_CONFIG, TASK_CONFIG) {
      return function() {
        return gulp
          .src('./src/*.html')
          .pipe(gulp.dest('./dist/'))
      }
    }
  },

  browserSync: {
    server: {
      // should match `dest` in path-config.json
      baseDir: 'dist'
    }
  },

  production: {
    rev: true
  }
}

import gulp from 'gulp';
import clean from 'gulp-clean';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Remove old files
 */
gulp.task('scss:clean', () => {
  return gulp.src('./frontend/css').pipe(clean({ read: false }));
});

/**
 * Compile all style files
 */
gulp.task('scss:compile', ['scss:clean'], () => {
  if (isProd) {
    return gulp.src('./frontend/src/scss/index.scss')
               .pipe(sass())
               .pipe(cleanCSS())
               .pipe(gulp.dest('./frontend/css'));

  } else {
    return gulp.src('./frontend/src/scss/index.scss')
               .pipe(sass())
               .pipe(sourcemaps.write())
               .pipe(gulp.dest('./frontend/css'));

  }
});

/**
 * Watch and recompile files
 */
gulp.task('scss:watch', ['scss:compile'], () => {
  const watch = gulp.watch(
    ['./frontend/src/scss/**/*.js'],
    ['scss:compile']
  );
  watch.on('change', event => {
    log(colors.yellow('Style change'), "'" + colors.cyan(event.path) + "'");
  });
});

import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import clean from 'gulp-clean';
import browserify from 'browserify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';

const isProd = process.env.NODE_ENV === 'production';

/**
 * Remove old files.
 */
gulp.task('js:clean', () => {
  return gulp.src('./frontend/js').pipe(clean({ read: false }));
});

/**
 * Compile the application
 */
gulp.task('js:compile', ['js:clean'], () => {

  if (isProd) {
    return browserify('./frontend/src/js/index.js')
             .transform('babelify', {presets: ['es2015', 'react']})
             .bundle()
             .pipe(source('app.js'))
             .pipe(buffer())
             .pipe(uglify())
             .pipe(gulp.dest('./frontend/js'));

  } else {
    return browserify('./frontend/src/js/index.js')
             .transform('babelify', {presets: ['es2015', 'react']})
             .bundle()
             .pipe(source('app.js'))
             .pipe(buffer())
             .pipe(gulp.dest('./frontend/js'));

  }
});

/**
 * Watch and recompile files
 */
gulp.task('js:watch', ['js:compile'], () => {
  const watch = gulp.watch(
    ['./frontend/src/js/**/*.js'],
    ['js:compile']
  );
  watch.on('change', event => {
    log(colors.yellow('Javascript change'), "'" + colors.cyan(event.path) + "'");
  });
});

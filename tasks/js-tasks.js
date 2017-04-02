import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import clean from 'gulp-clean';
import browserify from 'browserify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import { prepReload } from '../reloader/server-reloader';
import config from '../config';


/**
 * Remove old files.
 */
gulp.task('js:clean', () => {
  return gulp.src(config.frontend.jsDest).pipe(clean({ read: false }));
});

/**
 * Compile the application
 */
gulp.task('js:compile', ['js:clean'], () => {
  const stream = browserify(config.frontend.jsEntry)
                   .transform('babelify', {presets: ['es2015', 'react']})
                   .bundle()
                   .pipe(source('app.js'))
                   .pipe(buffer())
                   .pipe(gulpif(config.isProduction, uglify()))
                   .pipe(gulp.dest(config.frontend.jsDest));

  stream.on('end', prepReload);
  return stream;
});

/**
 * Watch and recompile files
 */
gulp.task('js:watch', ['js:compile'], () => {
  const watch = gulp.watch([config.frontend.jsSource], ['js:compile']);
  watch.on('change', event => {
    log(colors.yellow('Javascript change'), "'" + colors.cyan(event.path) + "'");
  });
});

import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import clean from 'gulp-clean';
import browserify from 'browserify';
import babelify from 'babelify';
import uglify from 'gulp-uglify';
import gulpif from 'gulp-if';
import source from 'vinyl-source-stream';
import buffer from 'vinyl-buffer';
import { prepReload } from '../utilities/reloader/server-reloader';
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
                   .transform('babelify')
                   .bundle().on('error', function (err) {
                     config.tmp.errors = config.tmp.errors || [];
                     config.tmp.errors.push(err.message);
                     console.log('');
                     console.log(colors.red('Browserify error:'), err.message);
                     console.log('');
                     return this.emit('end');
                   })
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

/**
 * Main js task
 */
gulp.task('js:main', ['js:clean', 'js:compile', 'js:watch']);

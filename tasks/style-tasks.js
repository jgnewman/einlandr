import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import clean from 'gulp-clean';
import sass from 'gulp-sass';
import cleanCSS from 'gulp-clean-css';
import sourcemaps from 'gulp-sourcemaps';
import gulpif from 'gulp-if';
import { prepReload } from '../reloader/server-reloader';
import config from '../config';

/**
 * Remove old files
 */
gulp.task('scss:clean', () => {
  return gulp.src(config.frontend.scssDest).pipe(clean({ read: false }));
});

/**
 * Compile all style files
 */
gulp.task('scss:compile', ['scss:clean'], () => {
  const stream = gulp.src(config.frontend.scssEntry)
                   .pipe(sass())
                   .pipe(gulpif(config.isProduction, cleanCSS(), sourcemaps.write()))
                   .pipe(gulp.dest(config.frontend.scssDest));

   stream.on('end', prepReload);
   return stream;
});

/**
 * Watch and recompile files
 */
gulp.task('scss:watch', ['scss:compile'], () => {
  const watch = gulp.watch([config.frontend.scssSource], ['scss:compile']);
  watch.on('change', event => {
    log(colors.yellow('Style change'), "'" + colors.cyan(event.path) + "'");
  });
});

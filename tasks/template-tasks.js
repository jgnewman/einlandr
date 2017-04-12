import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import clean from 'gulp-clean';
import mustache from 'gulp-mustache';
import { prepReload } from '../utilities/reloader/server-reloader';
import getReloadTemplate from '../utilities/reloader/browser-reloader';
import config from '../config';


/**
 * Remove old files
 */
gulp.task('templates:clean', () => {
  return gulp.src(config.frontend.templateCompiled).pipe(clean({ read: false }));
});

/**
 * Compile all template files
 */
gulp.task('templates:compile', ['templates:clean'], () => {
  const stream = gulp.src(config.frontend.templateEntry)
                     .pipe(mustache({ reload: config.isProduction ? '' : getReloadTemplate() }))
                     .pipe(gulp.dest(config.frontend.templateDest));

  stream.on('end', prepReload);
  return stream;
});

/**
 * Watch and recompile files
 */
gulp.task('templates:watch', ['templates:compile'], () => {
  const watch = gulp.watch([config.frontend.templateSource], ['templates:compile']);
  watch.on('change', event => {
    log(colors.yellow('Template change'), "'" + colors.cyan(event.path) + "'");
  });
});

/**
 * Main template task
 */
gulp.task('templates:main', ['templates:clean', 'templates:compile', 'templates:watch'])

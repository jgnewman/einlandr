import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import { startServer, refreshServer } from '../backend/server-init';
import config from '../config';

/**
 * Stop and restart the server
 */
gulp.task('server:refresh', next => {
  refreshServer();
  next();
})

/**
 * Start up the server
 */
gulp.task('server:start', next => {
  startServer();
  next();
});

/**
 * Watch files and restart when they change
 */
gulp.task('server:watch', () => {
  const watch = gulp.watch(config.backend.serverSource, ['server:refresh']);
  watch.on('change', event => {
    log(colors.yellow('Server file change'), "'" + colors.cyan(event.path) + "'");
  });
});

/**
 * Main server task
 */
gulp.task('server:main', ['server:start', 'server:watch']);

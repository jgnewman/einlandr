import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import migrate from '../backend/db-migrate';
import config from '../config';

/**
 * Create example values in the db
 */
gulp.task('db:migrate', () => {
  if (config.backend.dbEnabled) {
    migrate(() => process.exit(0));
  } else {
    log(colors.red('Database disabled. Please enable a database in the config.'));
  }
});

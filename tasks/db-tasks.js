import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import seed from '../backend/db-seed';
import config from '../config';

/**
 * Create example values in the db
 */
gulp.task('db:seed', () => {
  if (config.backend.dbEnabled) {
    seed(() => process.exit(0));
  } else {
    log(colors.red('Database disabled. Please enable a database in the config.'));
  }
});

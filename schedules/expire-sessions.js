import schedule from 'node-schedule';
import { log, colors } from 'gulp-util';
import dbReady from '../backend/db-init';
import config from '../config';

/**
 * Recurs as a cron job and cleans out invalid sessions
 * from the database. Frequency is set via config.backend.sessionCleanFrequency.
 */
dbReady((db, models, api) => {
  schedule.scheduleJob(config.backend.sessionCleanFrequency, () => {
    log(colors.yellow('Cleaning expired sessions...'));

    // Expire all sessions whose expiresAt field is less than now.
    api.deleteAllSession({
      expiresAt: {
        $lt: new Date()
      }
    })
    .then(result => {
      log(colors.blue(`Expired ${result} sessions`));
    });

  });
});

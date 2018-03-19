import schedule from 'node-schedule';
import { log, colors } from 'gulp-util';
import dbReady from '../db-init';
import config from '../../config';

/**
 * Recurs as a cron job and cleans out invalid sessions
 * from the database. Frequency is set via config.backend.sessionCleanFrequency.
 */
dbReady(({ Sessions }) => {
  schedule.scheduleJob(config.backend.sessionCleanFrequency, async() => {
    log(colors.yellow('Cleaning expired sessions...'));

    // Expire all sessions whose expiresAt field is less than now.
    const destroyed = await Sessions.destroyMany({ expiresAt: { $lt: new Date() }});
    log(colors.blue(`Expired ${destroyed} sessions`));

  });
});

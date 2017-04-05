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
    log(colors.yellow('Cleaning sessions...'));

    api.readAllSession({
      createdAt: {
        $lt: new Date(new Date() - config.backend.sessionExpiry * 60 * 60 * 1000)
      }
    }).then(sessions => {

      sessions.forEach(session => {
        log(colors.blue(`Expiring session ${session.id.slice(0, 40)}...`));
        api.deleteSession(session.id);
      });

    });
  });
});

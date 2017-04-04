import schedule from 'node-schedule';
import jwt from 'jsonwebtoken';
import { log, colors } from 'gulp-util';
import dbReady from './db-init';
import config from '../config';

/**
 * Recurs as a cron job and cleans out invalid sessions
 * from the database. Frequency is set via config.backend.sessionCleanFrequency.
 */
export function cleanSessions() {
  dbReady((db, models, api) => {
    schedule.scheduleJob(config.backend.sessionCleanFrequency, () => {
      log(colors.yellow('Cleaning sessions...'));

      api.readAllSession().then(sessions => {
        sessions.forEach(session => {

          jwt.verify(session.id, config.backend.dbSecret, err => {
            if (err) {
              log(colors.blue(`Removing session ${session.id.slice(0, 40)}...`));
              api.deleteSession(session.id);
            }
          });
        });
      });
    });
  });
}

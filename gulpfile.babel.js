import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import { finishRefreshing } from './reloader/server-reloader';
import config from './config';
import './tasks/server-tasks';
import './tasks/style-tasks';
import './tasks/js-tasks';
import './tasks/template-tasks';
import './tasks/db-tasks';


gulp.task('up', ['scss:main', 'js:main', 'templates:main', 'server:main'], () => {

  log(colors.blue('********'), colors.green(`App is alive!`), colors.blue('********'));
  log(colors.gray(`-- Environment       | ${colors.cyan(config.env)}`));
  log(colors.gray(`-- Listening on port | ${colors.cyan(config.backend.serverPort)}`));

  config.backend.ngrokEnabled &&
  log(colors.gray(`-- App available at  | ${colors.cyan(config.tmp.ngrokURL || '...')}`));

  config.tmp.schedules &&
  log(colors.gray(`-- Running schedules | ${colors.cyan(config.tmp.schedules.join(', '))}`));

  finishRefreshing();
});

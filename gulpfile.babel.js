import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import { finishRefreshing } from './reloader/server-reloader';
import config from './config';
import './tasks/server-tasks';
import './tasks/style-tasks';
import './tasks/js-tasks';
import './tasks/template-tasks';
import './tasks/db-tasks';

gulp.task('scss', ['scss:clean', 'scss:compile', 'scss:watch']);

gulp.task('js', ['js:clean', 'js:compile', 'js:watch']);

gulp.task('templates', ['templates:clean', 'templates:compile', 'templates:watch'])

gulp.task('serve', ['server:start', 'server:watch']);

gulp.task('up', ['scss', 'js', 'templates', 'serve'], () => {

  log(colors.blue('********'), colors.green(`App is alive!`), colors.blue('********'));
  log(colors.gray(`-- Environment       | ${colors.cyan(config.env)}`));
  log(colors.gray(`-- Listening on port | ${colors.cyan(config.backend.serverPort)}`));

  config.backend.ngrokEnabled &&
  log(colors.gray(`-- App available at  | ${colors.cyan(config.tmp.ngrokURL || '...')}`));

  config.tmp.schedules &&
  log(colors.gray(`-- Running schedules | ${colors.cyan(config.tmp.schedules.join(', '))}`));

  finishRefreshing();
});

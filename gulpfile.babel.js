import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import { finishRefreshing } from './reloader/server-reloader';
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
  log(colors.green('App is alive!'));
  finishRefreshing();
});

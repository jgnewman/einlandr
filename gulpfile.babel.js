import gulp from 'gulp';
import './tasks/server-tasks';
import './tasks/style-tasks';
import './tasks/js-tasks';

gulp.task('scss', ['scss:clean', 'scss:compile', 'scss:watch']);

gulp.task('js', ['js:clean', 'js:compile', 'js:watch']);

gulp.task('serve', ['server:start', 'server:watch']);

gulp.task('up', ['scss', 'js', 'serve']);

import gulp from 'gulp';
import mocha from 'gulp-mocha';

gulp.task('test:main', next => {
  return gulp.src(['test/**/*.js'], { read: false })
             .pipe(mocha({
               reporter: 'spec',
               compilers: 'js:babel-core/register'
             }));
});

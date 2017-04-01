import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import clean from 'gulp-clean';
import mustache from 'gulp-mustache';

const isProd = process.env.NODE_ENV === 'production';

function generateReloadCode() {
  return isProd ? '' : `
    <script>
      (function () {
        var interval;
        function ajax() {
          var xhr = new XMLHttpRequest();
          xhr.addEventListener('load', function () {
            if (this.status === 200) {
              if (JSON.parse(this.responseText).needsReload) {
                clearInterval(interval);
                location.reload();
              }
            }
          });
          xhr.open('GET', location.protocol + '//' + location.host + '/einlandr-reload');
          xhr.send();
        }
        interval = setInterval(ajax, 3000);
      }());
    </script>
  `;
}

/**
 * Remove old files
 */
gulp.task('templates:clean', () => {
  return gulp.src('./frontend/index.html').pipe(clean({ read: false }));
});

/**
 * Compile all template files
 */
gulp.task('templates:compile', ['templates:clean'], () => {
  return gulp.src('./frontend/src/templates/index.html')
             .pipe(mustache({ reload: generateReloadCode() }))
             .pipe(gulp.dest('./frontend'));
});

/**
 * Watch and recompile files
 */
gulp.task('templates:watch', ['templates:compile'], () => {
  const watch = gulp.watch(
    ['./frontend/src/templates/**/*'],
    ['templates:compile']
  );
  watch.on('change', event => {
    log(colors.yellow('Template change'), "'" + colors.cyan(event.path) + "'");
  });
});

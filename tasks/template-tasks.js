import gulp from 'gulp';
import { log, colors } from 'gulp-util';
import clean from 'gulp-clean';
import mustache from 'gulp-mustache';
import config from '../config';


function generateReloadCode() {
  return config.isProduction ? '' : `
    <script>
      (function () {
        var interval;
        var needsReload = false;
        function ajax(to, onload) {
          var xhr = new XMLHttpRequest();
          xhr.addEventListener('load', onload);
          xhr.open('GET', to);
          xhr.send();
        }
        function ajaxCycle() {
          ajax(
            location.protocol + '//' + location.host + '/einlandr-reload',
            function () {
              if (this.status === 200) {
                if (needsReload || JSON.parse(this.responseText).needsReload) {
                  needsReload = true;
                  ajax(location.href, function () {
                    if (this.status === 200) {
                      needsReload = false;
                      clearInterval(interval);
                      location.reload();
                    }
                  });
                }
              }
            }
          );
        }
        interval = setInterval(ajaxCycle, 3000);
      }());
    </script>
  `;
}

/**
 * Remove old files
 */
gulp.task('templates:clean', () => {
  return gulp.src(config.frontend.templateCompiled).pipe(clean({ read: false }));
});

/**
 * Compile all template files
 */
gulp.task('templates:compile', ['templates:clean'], () => {
  const stream = gulp.src(config.frontend.templateEntry)
                     .pipe(mustache({ reload: generateReloadCode() }))
                     .pipe(gulp.dest(config.frontend.templateDest));

  stream.on('end', config.actions.prepReload);
  return stream;
});

/**
 * Watch and recompile files
 */
gulp.task('templates:watch', ['templates:compile'], () => {
  const watch = gulp.watch([config.frontend.templateSource], ['templates:compile']);
  watch.on('change', event => {
    log(colors.yellow('Template change'), "'" + colors.cyan(event.path) + "'");
  });
});

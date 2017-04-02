var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var log = gutil.log;
var colors = gutil.colors;
var Timer = require('./timer');
var inject = require('./injector');

function makeStyles(names, callback) {
  var stylesDir, stylesIndex, newFileName, newFileContents;
  var timer = new Timer();

  timer.start();
  log('Starting', colors.cyan('new style layer') + '...');

  stylesDir = path.resolve(__dirname, '../', 'frontend', 'src', 'scss');
  stylesIndex = path.resolve(stylesDir, 'index.scss');
  newFileName = path.resolve(stylesDir, names.scssFile);
  newFileContents = names.scssSelector + ' {\n\n}';

  fs.writeFile(newFileName, newFileContents, function (err) {
    if (err) {
      log(error);
    } else {
      log(colors.yellow('Built'), names.scssFile);
      inject(stylesIndex, ["@import '" + names.scssImport + "';"]);
      log(colors.yellow('Injected'), 'new import line into index.scss');
      log('Finished', colors.cyan('new style layer'), "after", colors.magenta(timer.end()));
      callback && callback();
    }
  });
}

module.exports = makeStyles;

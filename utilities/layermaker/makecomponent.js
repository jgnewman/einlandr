var fs = require('fs');
var path = require('path');
var gutil = require('gulp-util');
var Timer = require('./timer');
var makeComponentTemplate = require('./makeComponentTemplate');

var log = gutil.log;
var colors = gutil.colors;

var componentName = process.argv[process.argv.length - 1].toLowerCase();
var componentNameCapital = componentName[0].toUpperCase() + componentName.slice(1);

// Die if there's no component name
if (process.argv.length < 3) {
  log(colors.red('Can not make a nameless component. Please try again using the pattern `yarn component <name>`'));
  process.exit(1);
}

var mainTimer = new Timer();
log('Building new React component', "'" + colors.cyan(componentNameCapital) + "'...");
mainTimer.start();

var names = {
  component: componentNameCapital,
  state: componentName,
  file: componentNameCapital + '.js',
  filePath: path.resolve(__dirname, '../', '../', 'frontend', 'src', 'js', 'components', componentNameCapital + '.js')
};

function finish() {
  log('Finished new React component', "'" + colors.cyan(componentNameCapital) + "' after", colors.magenta(mainTimer.end()));
}

fs.readFile(names.filePath, function (err) {
  if (err) {

    var template = makeComponentTemplate(names);

    fs.writeFile(names.filePath, template, function (err) {
      if (err) {
        log(colors.red('Failed to make new React component:'), err);
      }
      finish();
    });

  } else {

    log(colors.red('Detected a pre-existing' + names.component + ' file. Aborting...'));
    og('Process aborted.', colors.magenta(mainTimer.end()));

  }
});

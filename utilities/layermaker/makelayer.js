var gutil = require('gulp-util');
var Timer = require('./timer');
var makeStyles = require('./makestyles');
var makeJs = require('./makejs');
var log = gutil.log;
var colors = gutil.colors;

var layerName = process.argv[process.argv.length - 1].toLowerCase();
var mainTimer = new Timer();
var stylesFinished = false;
var jsFinished = true;

var layerNameUppercase, layerNameCapital, names;

// Die if there's no component name
if (process.argv.length < 3) {
  log(colors.red('Can not make a nameless layer. Please try again using the pattern `yarn layer <name>`'));
  process.exit(1);
}

log('Building new React layer', "'" + colors.cyan(layerName) + "'...");
mainTimer.start();

layerNameUppercase = layerName.toUpperCase();
layerNameCapital = layerNameUppercase[0] + layerName.slice(1);
names = {
  container: layerNameCapital + 'Container',
  containerFile: layerNameCapital + 'Container.js',
  component: layerNameCapital,
  componentFile: layerNameCapital + '.js',
  actions: layerName + 'Actions',
  actionsFile: layerName + 'Actions.js',
  data: layerName + 'Data',
  dataFile: layerName + 'Data.js',
  handlers: layerName + 'Handlers',
  handlersFile: layerName + 'Handlers.js',
  constants: layerNameUppercase,
  reducers: layerName + 'Reducers',
  reducersFile: layerName + 'Reducers.js',
  reducersImport: './' + layerName + 'Reducers',
  state: layerName,
  scssFile: '_' + layerName + '.scss',
  scssImport: './' + layerName,
  scssSelector: '#application .' + layerName
};

function finish() {
  log('Finished new React layer', "'" + colors.cyan(layerName) + "' after", colors.magenta(mainTimer.end()));
}

makeStyles(names, function () {
  stylesFinished = true;
  jsFinished && finish();
});

makeJs(names, function () {
  jsFinished = true;
  stylesFinished && finish();
})

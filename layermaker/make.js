var gutil = require('gulp-util');
var Timer = require('./timer');
var makeStyles = require('./makestyles');
var log = gutil.log;
var colors = gutil.colors;

var layerName = process.argv[process.argv.length - 1].toLowerCase();
var mainTimer = new Timer();

var ayerNameUppercase, layerNameCapital, names;

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
  state: layerName,
  scssFile: '_' + layerName + '.scss',
  scssImport: './' + layerName,
  scssSelector: '#application .' + layerName
};

makeStyles(names, function () {
  log('Finished new React layer', "'" + colors.cyan(layerName) + "' after", colors.magenta(mainTimer.end()));
});

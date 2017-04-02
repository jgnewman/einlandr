var path = require('path');
var fs = require('fs');
var gutil = require('gulp-util');
var log = gutil.log;
var colors = gutil.colors;
var Timer = require('./timer');
var inject = require('./injector');
var makeContainerTemplate = require('./makecontainertemplate');
var makeComponentTemplate = require('./makecomponenttemplate');

/*

Need to create:
  - actions file
  - data file
  - handler file
  - container file
  - component file

Need to inject:
  - constants
  - reducers import
  - reducers key/val
  - initialState key/val

*/

function makeConstantTemplate(capitalized, allCaps) {
  return '/**\n'
       + ' * Constants for ' + capitalize + '-related items\n'
       + ' */\n'
       + 'export const' + allCaps + ' = objectize([\n'
       + "  'FOO'\n"
       + ']);';
}

function makeReducerImportTemplate(reducers, reducersImport) {
  return 'import ' + reducers + " from '" + reducersImport + "';";
}

function makeReducerKeyVal(name, reducers) {
  return name + ': ' + reducers + ',';
}

function makeStateKeyVal(name) {
  return name + ': {},';
}

function makeActionsTemplate(constants) {
  return "import { " + constants + " } from '../lib/constants';\n"
       + "\n"
       + "export function foo() {\n"
       + "  return {\n"
       + "    type: " + constants + ".FOO\n"
       + "  }\n"
       + "}\n";
}

function makeDataTemplate(constants) {
  return "import axios from 'axios';\n"
       + "import brightsocket from 'brightsocket.io-client';\n"
       + "import { " + constants + " } from '../lib/constants';\n"
       + "\n"
       + "export function foo() {\n"
       + "\n"
       + "}\n";
}

function makeHandlerTemplate() {
  return "export function handleFoo(evt) {\n"
       + "  evt.preventDefault();\n"
       + "}\n";
}


function makeJs(names, callback) {
  var timer = new Timer();
  timer.start();
  log('Starting', colors.cyan('new JavaScript layer') + '...');

  var constantTemplate = makeConstantTemplate(names.component, names.constants);
  var reducerImportTemplate = makeReducerImportTemplate(names.reducers, names.reducersImport);
  var reducerKeyValTemplate = makeReducerKeyVal(names.state, names.reducers);
  var stateKeyValTemplate = makeStateKeyVal(names.state);
  var actionsTemplate = makeActionsTemplate(names.constants);
  var dataTemplate = makeDataTemplate(names.constants);
  var handlerTemplate = makeHandlerTemplate();
  var containerTemplate = makeConstantTemplate(names);
  var componentTemplate = makeComponentTemplate(names);

  var actionsPath = path.resolve(__dirname, 'frontend', 'src', 'js', 'actions', names.actionsFile);
  var dataPath = path.resolve(__dirname, 'frontend', 'src', 'js', 'data', names.dataFile);
  var handlersPath = path.resolve(__dirname, 'frontend', 'src', 'js', 'handlers', names.handlersFile);
  var containerPath = path.resolve(__dirname, 'frontend', 'src', 'js', 'containers', names.containerFile);
  var componentPath = path.resolve(__dirname, 'frontend', 'src', 'js', 'components', names.componentFile);
  var constantsIndex = path.resolve(__dirname, 'frontend', 'src', 'js', 'lib', 'constants.js');
  var reducersPath = path.resolve(__dirname, 'frontend', 'src', 'js', 'reducers', names.reducersFile);
  var reducersIndex = path.resolve(__dirname, 'frontend', 'src', 'js', 'reducers', 'reducers.js');
  var stateIndex = path.resolve(__dirname, 'frontend', 'src', 'js', 'state', 'initialstate.js');

  log('Finished', colors.cyan('new JavaScript layer'), "after", colors.magenta(timer.end()));
  callback && callback();
}

module.exports = makeJs;

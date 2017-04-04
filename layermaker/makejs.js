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
  - reducer file

Need to inject:
  - constants
  - reducers import
  - reducers key/val
  - initialState key/val

*/

function makeConstantTemplate(capitalized, allCaps) {
  return '/**\n'
       + ' * Constants for ' + capitalized + '-related items\n'
       + ' */\n'
       + 'export const ' + allCaps + ' = objectize([\n'
       + "  'FOO'\n"
       + ']);';
}

function makeReducerTemplate(allCaps, lowercase) {
  return "import initialState from '../state/initialstate';\n"
       + "import { " + allCaps + " } from '../lib/constants';\n"
       + "\n"
       + "export default function reducer(state = initialState." + lowercase + ", action) {\n"
       + "  switch (action.type) {\n"
       + "\n"
       + "    case " + allCaps + ".FOO:\n"
       + "      return Object.assign({}, state, {});\n"
       + "\n"
       + "    default:\n"
       + "      return state;\n"
       + "  }\n"
       + "}\n"
       ;
}

function makeReducerImportTemplate(reducers, reducersImport) {
  return 'import ' + reducers + " from '" + reducersImport + "';";
}

function makeReducerKeyVal(name, reducers) {
  return '  ' + name + ': ' + reducers + ',';
}

function makeStateKeyVal(name) {
  return '  ' + name + ': {},';
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

  var actionsTemplate       = makeActionsTemplate(names.constants);
  var dataTemplate          = makeDataTemplate(names.constants);
  var handlersTemplate      = makeHandlerTemplate();
  var containerTemplate     = makeContainerTemplate(names);
  var componentTemplate     = makeComponentTemplate(names);
  var reducersTemplate      = makeReducerTemplate(names.constants, names.state)
  var constantTemplate      = makeConstantTemplate(names.component, names.constants);
  var reducerImportTemplate = makeReducerImportTemplate(names.reducers, names.reducersImport);
  var reducerKeyValTemplate = makeReducerKeyVal(names.state, names.reducers);
  var stateKeyValTemplate   = makeStateKeyVal(names.state);

  var actionsPath    = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'actions', names.actionsFile);
  var dataPath       = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'data', names.dataFile);
  var handlersPath   = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'handlers', names.handlersFile);
  var containerPath  = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'containers', names.containerFile);
  var componentPath  = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'components', names.componentFile);
  var constantsIndex = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'lib', 'constants.js');
  var reducersPath   = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'reducers', names.reducersFile);
  var reducersIndex  = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'reducers', 'reducers.js');
  var stateIndex     = path.resolve(__dirname, '../', 'frontend', 'src', 'js', 'state', 'initialstate.js');

  // Write all new files...

  try {
    fs.writeFileSync(actionsPath, actionsTemplate);
    log(colors.yellow('Built'), names.actionsFile);
  } catch (err) {
    console.log(err);
  }

  try {
    fs.writeFileSync(dataPath, dataTemplate);
    log(colors.yellow('Built'), names.dataFile);
  } catch (err) {
    console.log(err);
  }

  try {
    fs.writeFileSync(handlersPath, handlersTemplate);
    log(colors.yellow('Built'), names.handlersFile);
  } catch (err) {
    console.log(err);
  }

  try {
    fs.writeFileSync(reducersPath, reducersTemplate);
    log(colors.yellow('Built'), names.reducersFile);
  } catch (err) {
    console.log(err);
  }

  try {
    fs.writeFileSync(containerPath, containerTemplate);
    log(colors.yellow('Built'), names.containerFile);
  } catch (err) {
    console.log(err);
  }

  try {
    fs.writeFileSync(componentPath, componentTemplate);
    log(colors.yellow('Built'), names.componentFile);
  } catch (err) {
    console.log(err);
  }

  // Inject all existing files...

  try {
    inject(constantsIndex, [constantTemplate]);
    log(colors.yellow('Injected'), 'new data into constants.js');
  } catch (err) {
    console.log(err);
  }

  try {
    inject(stateIndex, [stateKeyValTemplate]);
    log(colors.yellow('Injected'), 'new data into initialstate.js');
  } catch (err) {
    console.log(err);
  }

  try {
    inject(reducersIndex, [reducerImportTemplate, reducerKeyValTemplate]);
    log(colors.yellow('Injected'), 'new data into reducers.js');
  } catch (err) {
    console.log(err);
  }

  log('Finished', colors.cyan('new JavaScript layer'), "after", colors.magenta(timer.end()));
  callback && callback();
}

module.exports = makeJs;

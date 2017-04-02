import { log } from 'gulp-util';

const config = {

  // Environment values
  env: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',

  frontend: {

    // Javascript values
    jsEntry:   './frontend/src/js/index.js',
    jsDest:    './frontend/js',
    jsSource:  './frontend/src/js/**/*.js',

    // Scss values
    scssEntry:  './frontend/src/scss/index.scss',
    scssDest:   './frontend/css',
    scssSource: './frontend/src/scss/**/*.scss',

    // Template values
    templateEntry:    './frontend/src/templates/index.html',
    templateDest:     './frontend',
    templateSource:   './frontend/src/templates/**/*',
    templateCompiled: ['./frontend/index.html']
  },

  backend: {

    // top level files, tasks, and backend files
    serverSource: ['./*', './tasks/**/*', './backend/**/*', './reloader/**/*'],

    serverPort: 8080

  }
};



export default config;

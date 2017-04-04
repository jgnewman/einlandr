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

    serverPort: 8080,
    serverSource: [
      './*', // Glob top level files but not protected directories
      '!./{frontend,layermaker,.git,node_modules}',

      './tasks/**/*',   // gulp tasks
      './backend/**/*', // backend files
      './reloader/**/*' // reloader files
    ],

    // Session specific values
    sessionExpiry: 12, // This number is in hours

    // Database specific values
    dbEnabled: true,
    dbURL: process.env.DB_URL || '',
    dbSecret: process.env.DB_SECRET || '',
    dbDevName: process.env.DB_DEV_NAME || '',

    // Cross-origin resource sharing
    corsEnabled: false,
    ngrokEnabled: false

  }
};



export default config;

import { log } from 'gulp-util';

const config = {

  // Environment values
  env: process.env.NODE_ENV,
  isProduction: process.env.NODE_ENV === 'production',
  tmp: {},

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

    serverPort: process.env.PORT || 5000,
    serverSource: [
      './*', // Glob top level files but not protected directories
      '!./{frontend,.git,test,node_modules}',

      './tasks/**/*',     // gulp tasks
      './backend/**/*',   // backend files
      './utilities/**/*', // utility files
    ],

    // Session specific values
    sessionExpiry: 12, // This number is in hours since last use
    sessionCleanFrequency: '0 */12 * * *', // Should be in cron format (every 12 hours)
    sessionSuppression: 2, // An amount of expired sessions to delete for evey new session

    // Database specific values
    dbEnabled: true,
    dbURL: process.env.DATABASE_URL || '',
    dbSecret: process.env.DATABASE_SECRET || '',
    dbDevName: process.env.DATABASE_DEV_NAME || '',
    dbDevPwd: process.env.DATABASE_DEV_PASSWORD || '',

    // Cross-origin resource sharing
    corsEnabled: false,
    ngrokEnabled: true

  }
};



export default config;

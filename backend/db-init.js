import Sequelize from 'sequelize';
import { log, colors } from 'gulp-util';
import defineModels from './db-models';
import config from '../config';

const connectHooks = [];
let connected = false;
let connecting = false;
let db, models;

function generateDBErr(err) {
  return ` Unable to connect to the database: "${err}"
           Make sure you have created the database and turned it on.
           You can also disable usage of a database in the config.
         `.trim();
}

// Istantiate sequelize if the db is enabled in the config
function dbConnect() {
  if (config.backend.dbEnabled && !connecting) {
    let tempDB;
    connecting = true;
    log(colors.yellow('Attempting to connect to database...'));

    // Production database is optimized for heroku by default
    if (config.isProduction) {

      /******************************
       * Setup your prod db here
       ******************************/

      let cred = config.backend.dbURL;
      cred = cred.replace(/^[^\@]+\@/, ''); // Slice off everything before host and port
      cred = cred.replace(/\/.+$/, ''); // Slice off everything after the port
      cred = cred.split(':'); // Turn it into an array of host and port
      const host = cred[0];
      const port = cred[1];
      tempDB = new Sequelize(config.backend.dbURL, {
        dialect:  'postgres',
        protocol: 'postgres',
        port:     port,
        host:     host,
        logging:  true //false
      })

    // Dev database is optimized for localhost
    } else {

      /******************************
       * Setup your dev db here
       ******************************/

      tempDB = new Sequelize(config.backend.dbDevName, 'postgres', '', {
        host: 'localhost',
        dialect: 'postgres',
        pool: {
          max: 5,
          min: 0,
          idle: 10000
        }
      });
    }

    /******************************
     * Connect to your db here
     ******************************/

    const authenticated = tempDB.authenticate();

    authenticated.then(() => {
      log(colors.yellow('Database connection established'));
      connected = true;
      connecting = false;
      db = tempDB;
      models = defineModels(tempDB);

      // Necessary for dbReady to function properly.
      connectHooks.forEach(hook => hook(tempDB, models));
    });

    authenticated.catch(err => {
      log(colors.red(generateDBErr(err)));
      connecting = false;
      process.exit(1);
    });

    return authenticated;

  }

}

/**
 * Registers a function to be called when the database has
 * connected. If already connected, the function is called
 * immediately. If the database connection has not been
 * established, will trigger a connection.
 *
 * @param  {Function} hook  Optional. Runs once on successful connection.
 *
 * @return {undefined}
 */
export default function dbReady(hook) {
  if (config.backend.dbEnabled) {
    connected && hook && hook(db, models);
    hook && connectHooks.push(hook);

    // If the database appears to have no intention of
    // connecting on its own, connect to it so our
    // hooks can actually run.
    if (!connected && !connecting) {
      dbConnect();
    }
  }
}
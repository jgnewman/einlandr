import dbReady from './db-init';
import { log, colors } from 'gulp-util';

function create(model, values, logMsg) {
  const mod = model.create(values);
  logMsg && mod.then(() => log(colors.green(logMsg)));
  mod.catch(err => log(colors.red(err)));
  return mod;
}

export default function migrate(callback) {
  dbReady((db, models) => {
    log(colors.cyan('Migrating database...'));

    // Drop existing tables and create schema
    db.sync({ force: true })

      /******************************
       * Create your data here
       ******************************/

       // Example.
       // Note that a user record is necessary for
       // authentication to work.
      .then(() => create(models.User, {
        firstName: 'John',
        lastName: 'Doe',
        email: 'fake@fake.com',
        password: 'asdf;laksjdf'
      }, 'Created user John Doe'))

      // Example.
      .then(() => create(models.User, {
        firstName: 'David',
        lastName: 'Cohen',
        email: 'example@example.com',
        password: 'qweproiupoi'
      }, 'Created user David Cohen'))

      // Necessary for the migrate task to exit properly
      .then(() => {
        callback && callback();
      });

  });
}

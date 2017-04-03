import dbReady from './db-init';
import { log, colors } from 'gulp-util';

function removePassword(record) {
  if (Object.prototype.hasOwnProperty.call(record, 'password')) {
    delete record.password;
  }
  return record;
}

function asyncRemovePassword(recordPromise) {
  return new Promise((resolve, reject) => {
    recordPromise.catch(err => reject(err));
    recordPromise.then(result => {
      if (!result) {
        reject('No record found.');
      } else {
        try {
          const clean = removePassword(result);
          resolve(clean);
        } catch (err) {
          reject(err);
        }
      }
    });
  });
}

function asyncUnpack(recordPromise) {
  return new Promise((resolve, reject) => {
    recordPromise.catch(err => reject(err));
    recordPromise.then(result => {
      if (Array.isArray(result)) {
        const desiredItem = result[1]; // result[0] is the number of affected rows
        if (Array.isArray(desiredItem)) {
          resolve(removePassword(desiredItem[0]));
        } else {
          resolve(removePassword(desiredItem));
        }
      } else {
        resolve(removePassword(result));
      }
    });
  });
}

export default function defineAPI(db, models) {
  const api = {};

  // Automatically handle CRUD operations for each model
  Object.keys(models).forEach(key => {

    // Make a create function for each model
    api[`create${key}`] = values => {
      const promise = models[key].create(values);
      promise.catch(err => log(colors.red(err)));
      promise.then(() => log(colors.green(`Successfully created ${key}`)));
      return asyncRemovePassword(promise);
    };

    // Make a read-by-id function for each model
    api[`read${key}`] = primaryKey => {
      const promise = models[key].findById(primaryKey);
      promise.catch(err => log(colors.red(err)));
      promise.then(result => {
        result ? log(colors.green(`Successfully retrieved ${key}`))
               : log(colors.blue(`Could not find a matching record.`));
      });
      return asyncRemovePassword(promise);
    };

    // Make an update-by-id function for each model
    api[`update${key}`] = (primaryKey, values) => {
      const promise = models[key].update(values, {
        where: { id: primaryKey },
        returning: true
      });
      promise.catch(err => log(colors.red(err)));
      promise.then(result => {
        result[0] ? log(colors.green(`Successfully updated ${key}`))
                  : log(colors.blue('No records were updated.'));
      });
      return asyncUnpack(promise);
    };

    // Make a read-by-id function for each model
    api[`delete${key}`] = primaryKey => {
      const promise = models[key].destroy({ where: { id: primaryKey } });
      promise.catch(err => log(colors.red(err)));
      promise.then(() => log(colors.green(`Successfully deleted ${key}`)));
      return promise;
    };

    /***********************************
     * Define the rest of your API here
     ***********************************/

    // Example
    // Note, this is necessary for authentication to work.
    api.authUser = (email, password) => {
      const promise = models.User.findOne({
        where: { email: email, password: password }
      });
      promise.catch(err => log(colors.red(err)));
      promise.then(result => {
        result ? log(colors.green(`Found user with matching email & password.`))
               : log(colors.blue(`Could not find user with matching email & password.`));
      });
      return asyncRemovePassword(promise);
    };

  });

  return api;
}

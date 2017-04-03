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
    recordPromise.then(result => resolve(removePassword(result)));
  });
}

function asyncUnpack(recordPromise) {
  return new Promise((resolve, reject) => {
    recordPromise.catch(err => reject(err));
    recordPromise.then(result => {
      if (Array.isArray(result)) {
        const desiredItem = result[1]; // result[0] is the number of affected rows
        if (Array.isArray(desiredItem)) {
          resolve(removePassword(esiredItem[0]));
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
      promise.then(() => log(colors.green(`Successfully retrieved ${key}`)));
      return asyncRemovePassword(promise);
    };

    // Make an update-by-id function for each model
    api[`update${key}`] = (primaryKey, values) => {
      const promise = models[key].update(values, {
        where: { id: primaryKey },
        returning: true
      });
      promise.catch(err => log(colors.red(err)));
      promise.then(() => log(colors.green(`Successfully updated ${key}`)));
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

    // Example. (Normally it's good to return a promise)
    // api.getItemsByUser = userId => {
    //   return new Promise((resolve, reject) => {
    //     const user = api.readUser(userId); // Find the right user.
    //     const items = [];
    //     user.catch(err => reject(err)); // Spit out an error if there's a problem.
    //     user.then(userRecord => {
    //       userRecord.items.forEach(itemId => {
    //         const item = api.readItem(itemId);
    //         item.catch(err => reject(err));
    //         item.then(itemRecord => {
    //           items.push(itemRecord);
    //           if (items.length === userRecord.items.length) {
    //             resolve(items);
    //           }
    //         });
    //       });
    //     });
    //   });
    // };

  });

  return api;
}

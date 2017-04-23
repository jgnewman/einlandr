import { log, colors } from 'gulp-util';
import promiser from 'stateful-promise';
import { simplify } from './db-utils';
import { verifyPassword } from './password-tools';


export default function defineQueries(db, models) {
  const queries = {};

  // Automatically handle CRUD operations for each model
  Object.keys(models).forEach(key => {

    // Make a create function for each model
    queries[`create${key}`] = (values, res) => {
      const promise = models[key].create(values);
      promise.catch(err => {
        log(colors.red(err));
        res && res.sendStatus(500);
      });
      promise.then(() => log(colors.green(`Successfully created ${key}`)));
      return simplify(promise);
    };

    // Make a read-by-id function for each model
    queries[`read${key}`] = (primaryKey, res) => {
      const promise = models[key].findById(primaryKey);
      promise.catch(err => {
        log(colors.red(err));
        res && res.sendStatus(500);
      });
      promise.then(result => {
        result ? log(colors.green(`Successfully retrieved ${key}`))
               : log(colors.blue(`Could not find a matching record.`));
      });
      return simplify(promise);
    };

    // Make a read-all function for each model
    // BE CAREFUL USING THIS IF YOU HAVE LOTS OF RECORDS!
    // `where` is an optional object of sequelize attributes
    queries[`readAll${key}`] = (where, res) => {
      const promise = models[key].findAll(where ? { where: where } : undefined);
      promise.catch(err => {
        log(colors.red(err));
        res && res.sendStatus(500);
      });
      promise.then(result => {
        result[0] ? log(colors.green(`Successfully retrieved ${key} records`))
                  : log(colors.blue('No records were retrieved.'));
      });
      return simplify(promise);
    };

    // Make an update-by-id function for each model
    queries[`update${key}`] = (primaryKey, values, res) => {
      const promise = models[key].update(values, {
        where: { id: primaryKey },
        returning: true
      });
      promise.catch(err => {
        log(colors.red(err));
        res && res.sendStatus(500);
      });
      promise.then(result => {
        result[0] ? log(colors.green(`Successfully updated ${key}`))
                  : log(colors.blue('No records were updated.'));
      });
      return simplify(promise, { useHead: true });
    };

    // Make a read-by-id function for each model
    queries[`delete${key}`] = (primaryKey, res) => {
      const promise = models[key].destroy({ where: { id: primaryKey } });
      promise.catch(err => {
        log(colors.red(err));
        res && res.sendStatus(500);
      });
      promise.then(() => log(colors.green(`Successfully deleted ${key}`)));
      return promise;
    };

    // Make a delete-all function for each model
    // BE CAREFUL USING THIS IF YOU HAVE LOTS OF RECORDS!
    // `where` is an optional object of sequelize attributes
    queries[`deleteAll${key}`] = (where, res) => {
      const promise = models[key].destroy(where ? { where: where } : undefined);
      promise.catch(err => {
        log(colors.red(err));
        res && res.sendStatus(500);
      });
      promise.then(result => {
        result ? log(colors.green(`Successfully deleted ${result} ${key} records`))
               : log(colors.blue('No records were deleted.'));
      });
      return promise;
    };

  });

  /***************************************
   * Define the rest of your queries here
   ***************************************/

  // Example
  // Note, this is necessary for authentication to work.
  queries.authUser = (email, password) => {
    return new Promise((resolve, reject) => {
      promiser()

      .then(state => {
        return state.set('user', simplify(
          models.User.findOne({ where: { email: email } }),
          { preservePwd: true }
        ), 401)
      })

      .then(state => {
        return state.rejectIf(!state.user, 401)
      })

      .then(state => {
        return state.set('validated', verifyPassword(
          password,
          state.user.password,
          Buffer(state.user.pwdSalt),
          state.user.pwdIterations
        ), 500)
      })

      .then(state => {
        return state.rejectIf(!state.validated, 401)
      })

      .then(state => resolve(state.user))
      .catch((_, err) => reject(err))
    });
  };

  // Example
  // Note, this is necessary for authentication to work.
  queries.suppressSession = (amount = 2) => {
    const promise = models.Session.destroy({
      limit: amount,
      where: { expiresAt: { $lt: new Date() } }
    });
    promise.catch(err => log(colors.red(err)));
    promise.then(result => {
      result ? log(colors.green(`Successfully deleted ${result} Session records`))
             : log(colors.blue('No records were deleted.'));
    });
    return promise;
  };

  return queries;
}

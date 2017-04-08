/**
 * This file will simplify sequelize results for
 * any of the following data types:
 *
 * Array of Instances
 * Instance
 * Array of <count, rows>
 *
 * It will also remove any data field called "password" by default to help
 * ensure that passwords don't go out to the front end.
 */

/**
 * If the argument is an object with a password field,
 * deletes the password field. Returns the argument.
 */
function cutPassword(value) {
  if (
    value
      && typeof value === 'object'
      && Object.prototype.hasOwnProperty.call(value, 'password')
  ) {
    delete value.password;
  }
  return value;
}

/**
 * Takes a value and user options. If the user options
 * have `preservePwd:true`, returns the value. Otherwise,
 * removes any password field from the value.
 */
function maybeCutPassword(value, options) {
  return options.preservePwd ? value : cutPassword(value);
}

/**
 * Takes an array returned from sequelize and a collection
 * of user options. Reduces the array down to an array of
 * simplified values using the options.
 */
function breakDownArray(array, options) {
  const values = typeof array[0] === 'number' ? array[1] : array;
  return values.map(obj => breakDown(obj, options));
}

/**
 * Determines how to simplify sequelize results based on the format
 * of those results.
 */
function breakDown(dbResult, options) {
  if (Array.isArray(dbResult)) {
    return breakDownArray(dbResult, options);
  } else if (
      dbResult
        && typeof dbResult === 'object'
        && Object.prototype.hasOwnProperty.call(dbResult, 'dataValues')
  ) {
    return maybeCutPassword(dbResult.dataValues, options);
  } else {
    return maybeCutPassword(dbResult, options);
  }
}

/**
 * If the provided value is an array, take out the
 * first item in the array.
 *
 * @param  {Any} value  Might be an array.
 *
 * @return {Any} The first value in the array if it was an array,
 *               otherwise the original value.
 */
function useHead(value) {
  return Array.isArray(value) ? value[0] : value;
}

/****************************
 * Begin exported functions
 ****************************/

/**
 * Simplify values returned from a CRUD operation.
 *
 * @param  {Promise} promise  The original promise from sequelize.
 * @param  {Object}  options  Key(preservePwd:true) will keep pwds in recoreds.
 *                            Key(useHead:true) will de-arrayify by using only the first value.
 *
 * @return {Promise}          Resolves with simplified values.
 */
export function simplify(promise, options) {
  options = options || {};
  return new Promise((resolve, reject) => {
    promise.catch(err => reject(err));
    promise.then(result => {
      const brokenDown = breakDown(result, options);
      const cleanResult = options.useHead ? useHead(brokenDown) : brokenDown;
      resolve(cleanResult);
    });
  });
}

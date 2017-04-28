
/**
 * Turn an array of strings into an object of mirrored keys
 *
 * @param  {String} prefix  A string to prefix constants with.
 * @param  {Array}  array   An array of strings
 *
 * @return {Object}         Where keys and values are the same.
 */
function objectize(prefix, array) {
  const obj = {};
  array.forEach(item => obj[item] = prefix + '_' + item);
  return obj;
}


/* INJECT POINT 1 */
/**
 * Constants for App-related items
 */
export const APP = objectize('APP', [
  'FOO'
]);

/**
 * Constants for Global-related items
 */
export const GLOBALS = objectize('GLOBALS', [
  'FOO'
]);

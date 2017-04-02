
/**
 * Turn an array of strings into an object of mirrored keys
 *
 * @param  {Array}  array  An array of strings
 *
 * @return {Object}        Where keys and values are the same.
 */
function objectize(array) {
  const obj = {};
  array.forEach(item => obj[item] = item);
  return obj;
}


/* INJECT POINT 1 */
/**
 * Constants for App-related items
 */
export const APP = objectize([
  'FOO'
]);

/**
 * Constants for Global-related items
 */
export const GLOBALS = objectize([
  'FOO'
]);

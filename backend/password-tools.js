/**
 * How to create secure passwords
 *
 * - Use a strong random number generator to create a salt of 16 bytes or longer.
 * - Feed the salt and the password into the PBKDF2 algorithm.
 * - Use HMAC-SHA-256 or HMAC-SHA-512 as the core hash inside PBKDF2.
 * - Perform 100,000 iterations or more. (April 2017.)
 * - Take 32 bytes (256 bits) of output from PBKDF2 as the final password hash.
 * - Store the iteration count, the salt and the final hash in your password database.
 * - Increase your iteration count regularly to keep up with faster cracking tools.
 */
import secureRandom from 'secure-random';
import { pbkdf2 } from 'crypto';


function createSalt() {
  return secureRandom(16);
}

function createHash(password, salt, iterations) {
  salt = salt instanceof Buffer ? salt : Buffer(salt);
  return new Promise((resolve, reject) => {
    pbkdf2(password, salt, iterations, 512, 'sha512', (err, key) => {
      err ? reject(err) : resolve(key.toString('hex'));
    })
  })
}

/**
 * Hashes and salts a password.
 *
 * @param  {String} password  An initial password string.
 *
 * @return {Promise} Resolves with an object containing...
 *                   hash:       {String} The hashed password.
 *                   salt:       {Array}  The salt used on the hash.
 *                   iterations: {Number} The amount of hashing iterations.
 */
export function createHashAndSalt(password) {
  return new Promise((resolve, reject) => {
    const salt = createSalt();
    createHash(password, salt, 100000)
      .then(hash => resolve({ hash: hash, salt: salt, iterations: 100000 }))
      .catch(err => reject(err))
  });
}

/**
 * Verifies a password.
 *
 * @param  {String}       password     A user-provided password string.
 * @param  {String}       hashToMatch  The hashed password we need to match.
 * @param  {Array|Buffer} salt         Used for salting in the algorithm.
 * @param  {Number}       iterations   How many hashing iterations to run.
 *
 * @return {Promise}      Resolves with a boolean. True if the password was
 *                        able to be verified or false if not.
 */
export function verifyPassword(password, hashToMatch, salt, iterations) {
  return new Promise((resolve, reject) => {
    createHash(password, salt, iterations)
      .then(resultingHash => resultingHash === hashToMatch ? resolve(true) : resolve(false))
      .catch(err => reject(err))
  });
}

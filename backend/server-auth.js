import jwt from 'jsonwebtoken';
import dbReady from './db-init';
import config from '../config';

/**
 * Takes a valid user record and generates a new session based
 * on that record.
 *
 * @param  {Object}   record        A valid user record.
 * @param  {Function} createSession A function for creating a session in the database.
 *                                  Should return a promise.
 *
 * @return {Promise}                Resolves when the session has been created.
 */
export function generateSession(record, createSession) {
  return new Promise((resolve, reject) => {
    const expiration = config.backend.sessionExpiry;
    const token = jwt.sign(
      { data: record },
      config.backend.dbSecret,
      { expiresIn: (60 * 60) * expiration
    });
    const creator = createSession({ id: token });
    creator.then(() => resolve(token));
    creator.catch(err => reject(err));
  });
}

/**
 * Takes a valid session token and destroys the associated session.
 *
 * @param  {String}   token         A valid session token.
 * @param  {Function} deleteSession A function for deleting a session in the database.
 *                                  Should return a promise.
 *
 * @return {Promise}                Resolves when the session has been deleted.
 */
export function destroySession(token, deleteSession) {
  return new Promise((resolve, reject) => {
    const remover = deleteSession(token);
    remover.then(() => resolve());
    remover.catch(() => reject());
  });
}

/**
 * Takes a session token and determines whether it is valid.
 *
 * @param  {String}   token         A valid session token.
 * @param  {Function} readSession   A function for reading a session from the database.
 *                                  Should return a promise.
 * @param  {Function} deleteSession A function for deleting a session in the database.
 *                                  Should return a promise.
 *
 * @return {Promise}                Resolves if the session is valid.
 *                                  If it rejects, destroys the session.
 */
export function validateSession(token, readSession, deleteSession) {
  return new Promise((resolve, reject) => {
    const getter = readSession(token);

    getter.catch(() => {
      reject();
    });

    getter.then(session => {
      if (!session) {
        reject();
      } else {
        jwt.verify(session.id, config.backend.dbSecret, err => {
          if (err) {
            destroySession(session.id, deleteSession);
            reject();
          } else {
            resolve();
          }
        });
      }
    });

  });
}

/**
 * Custom middleware for checking whether a request is authenticated.
 *
 * If a request is authenticated, adds `isAuthenticated: true` to `req`.
 * If not authenticated, adds `isAuthenticated: false` to `req`.
 *
 * To authenticate, we use the `validateSession` function which takes a
 * jsonwebtoken and tries to verify it. If it verifies, we set
 * `isAuthenticated` to `true`.
 *
 * An example jQuery call that will authenticate is as follows:
 *
 * $.ajax({
 *   method: 'POST',
 *   url: '/api/v1/<SOME_PATH>/',
 *   headers: { Authorization: 'Basic <SESSION_ID>' },
 *   dataType: 'json',
 *   data: <SOME_DATA>
 * });
 *
 * @return {Function} Works as express middleware.
 */
export function checkAuth() {
  return (req, res, next) => {
    req.isAuthenticated = false;

    if (typeof req.headers.authorization === 'string') {
      const token = req.headers.authorization.split(' ')[1];

      dbReady((db, models, dbAPI) => {
        const validator = validateSession(token, dbAPI.readSession, dbAPI.deleteSession);

        validator.then(() => {
          req.isAuthenticated = true;
          next();
        });

        validator.catch(() => next());
      })

    } else {
      next();
    }
  };
}

/**
 * Custom middleware to require authentication for some application routes
 * either explicitly or by prefix. Also allows bypasses for certain matches
 * either explicitly or by prefix.
 *
 * Example:
 *
 * app.use(applyAuth({
 *   requireFor: ['/api/v1/*'],
 *   bypassFor: ['/api/v1/users/*']
 * }));
 *
 * This example will require authentication for any routes prefixed as being
 * part of api v1. However, it will not require authentication for calls to
 * users within that structure.
 *
 * @param  {Object} manifest Contains two keys: requireFor and bypassFor. Each
 *                           of these should be an array denoting matches
 *                           for each case.
 *
 * @return {Function} Works as express middleware.
 */
export function applyAuth(manifest) {
  const required = manifest.requireFor || [];
  const bypassed = manifest.bypassFor || [];

  // Checks if a url matchs any paths in an array.
  function matches(url, array) {
    let matchFound = false;
    const endSlash = /\/$/;
    const cleanUrl = url.replace(endSlash, '');
    return array.some(route => {
      if (route[route.length - 1] === '*') {
        if (cleanUrl.indexOf(route.slice(0, route.length - 1)) === 0) {
          return (matchFound = true);
        }
      } else {
        if (cleanUrl.replace(endSlash, '') === route.replace(endSlash, '')) {
          return (matchFound = true);
        }
      }
    });
    return matchFound;
  }

  return (req, res, next) => {
    if (req.isAuthenticated) {
      next();
    } else {
      if (!matches(req.url, required)) {
        console.log(`REQUEST -- ${req.url} does not require authentication.`);
        next();
      } else {
        if (matches(req.url, bypassed)) {
          console.log(`REQUEST -- ${req.url} allows authentication bypass.`);
          next();
        } else {
          console.log(`REQUEST -- ${req.url} requires authentication. Request denied.`);
          res.sendStatus(401);
        }
      }
    }
  };
}

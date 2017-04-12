import jwt from 'jsonwebtoken';
import { log } from 'gulp-util';
import dbReady from './db-init';
import config from '../config';

/**
 * Takes a valid user record and generates a new session based
 * on that record.
 *
 * @param  {Object}   record          A valid user record.
 * @param  {Function} createSession   A db query function for creating a session in the database.
 *                                    Should return a promise.
 * @param  {Function} suppressSession A db query function for suppressing sessions in the database.
 *                                    Should return a promise.
 *
 * @return {Promise}                  Resolves when the session has been created.
 */
export function generateSession(record, createSession, suppressSession) {
  return new Promise((resolve, reject) => {

    const suppression = config.backend.sessionSuppression;
    const expiration = config.backend.sessionExpiry;
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + expiration);

    const token = jwt.sign(
      { data: record },
      config.backend.dbSecret,
      { expiresIn: 60 * 60 * 24 * 365 * 100 } // 100 years-ish; we don't want to expire this way
    );

    const creator = createSession({ id: token, expiresAt: expirationDate });
    creator.catch(err => reject(err));
    creator.then(session => {

      // Remove some amount of sessions for every new session we create.
      // Don't let it slow us down from resolving if the creation was successful.
      suppression && suppressSession(suppression);
      resolve(session);
    });
  });
}

/**
 * Takes a valid session token and destroys the associated session.
 *
 * @param  {String}   token         A valid session token.
 * @param  {Function} deleteSession A db query function for deleting a session in the database.
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
 * Takes a valid session token and updates the associated session.
 *
 * @param  {String}   token         A valid session token.
 * @param  {Function} updateSession A db query function for updating a session in the database.
 *                                  Should return a promise.
 *
 * @return {Promise}                Resolves when the session has been updated.
 */
export function modifySession(token, updateSession) {
  return new Promise((resolve, reject) => {

    const expiration = config.backend.sessionExpiry;
    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + expiration);

    const modifier = updateSession(token, {
      updatedAt: null,
      expiresAt: expirationDate // Restart the countdown to expiration
    });

    modifier.catch(err => reject(err));
    modifier.then(updated => resolve(updated));
  });
}

/**
 * Takes a session token and determines whether it is valid.
 *
 * @param  {String}   token         A valid session token.
 * @param  {Function} readSession   A db query function for reading a session from the database.
 *                                  Should return a promise.
 * @param  {Function} updateSession A db query function for updating a session in the database.
 *                                  Should return a promise.
 * @param  {Function} deleteSession A db query function for deleting a session in the database.
 *                                  Should return a promise.
 *
 * @return {Promise}                Resolves if the session is valid.
 *                                  If it rejects, destroys the session.
 */
export function validateSession(token, readSession, updateSession, deleteSession) {
  return new Promise((resolve, reject) => {
    const getter = readSession(token);

    getter.catch(err => {
      reject(err);
    });

    getter.then(session => {
      if (!session) {
        reject('Session does not exist.');

      } else {
        const expiresAt = new Date(session.expiresAt);
        const now = new Date();

        // Session has expired if the current time is later than the
        // expiration time.
        if (now >= expiresAt) {
          destroySession(session.id, deleteSession);
          reject('Session expired.');

        } else {
          jwt.verify(session.id, config.backend.dbSecret, err => {
            if (err) {
              destroySession(session.id, deleteSession);
              reject(err);
            } else {
              modifySession(session.id, updateSession)
                .catch(err => reject(err))
                .then(moddedSession => resolve(moddedSession));
            }
          });
        }
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

      dbReady(queries => {
        const validator = validateSession(
          token,
          queries.readSession,
          queries.updateSession,
          queries.deleteSession
        );

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
        log(`REQUEST -- ${req.url} does not require authentication.`);
        next();
      } else {
        if (matches(req.url, bypassed)) {
          log(`REQUEST -- ${req.url} allows authentication bypass.`);
          next();
        } else {
          log(`REQUEST -- ${req.url} requires authentication. Request denied.`);
          res.sendStatus(401);
        }
      }
    }
  };
}

import jwt from 'jsonwebtoken';
import { log } from 'gulp-util';
import dbReady from './db-init';
import config from '../config';

/**
 * Custom middleware for checking whether a request is authenticated.
 *
 * If a request is authenticated, adds `isAuthenticated: true` to `req`.
 * If not authenticated, adds `isAuthenticated: false` to `req`.
 *
 * To authenticate, we use the `Sessions.validate` function which takes a
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

      dbReady(async({ Sessions }) => {
        try {
          const validator = await Sessions.validate(token);
          req.isAuthenticated = true;
          next();

        } catch (_) {
          next();
        }
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

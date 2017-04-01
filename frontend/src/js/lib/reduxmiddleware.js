import { compose } from 'redux';

/**
 * Creates a function that takes `state` and `next`.
 * State is the full redux state.
 * Next calls the next action.
 */
export function createBasicMiddleware(fn) {
  return function ({ getState }) {
    return (next) => (action) => {
      return fn(getState(), () => next(action));
    }
  }
}

/**
 * Calls redux compose but passes in dev tools if dev tools
 * exists in the environment.
 */
export function devToolsCompose(...args) {
  if (window.__REDUX_DEVTOOLS_EXTENSION__) {
    args.push(window.__REDUX_DEVTOOLS_EXTENSION__());
  }
  return compose.apply(null, args);
}

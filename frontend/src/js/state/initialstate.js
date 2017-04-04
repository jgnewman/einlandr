import { retrieveState } from '../lib/localPersist';

const initialState = {
  /* INJECT POINT 1 */
  app: {}

};

function hydrateInitialState() {
  const storage = retrieveState();
  return storage || initialState;
}

export default hydrateInitialState();

import { retrieveState } from '../lib/localpersist';

const initialState = {
  /* INJECT POINT 1 */
  app: {}

};

function hydrateInitialState() {
  const storage = retrieveState();
  return storage || initialState;
}

export default hydrateInitialState();

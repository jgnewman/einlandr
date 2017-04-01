import initialState from '../state/initialstate';
import { APP } from '../lib/constants';

export default function reducer(state = initialState.app, action) {
  switch (action.type) {

    case APP.FOO:
      return Object.assign({}, state, {});

    default:
      return state;
  }
}

import { createStore, combineReducers, applyMiddleware } from 'redux';
import { createBasicMiddleware, devToolsCompose } from '../lib/reduxmiddleware';
import { saveState } from '../lib/localpersist';
import initialState from './initialstate';
import reducers from '../reducers/reducers';

const store = createStore(
  combineReducers(reducers),
  initialState,
  devToolsCompose(
    applyMiddleware(
      createBasicMiddleware((state, next) => {
        // Nothing for now but we may need this later
        next();
      })
    )
  )
);

store.subscribe(function (state) {
  saveState(store.getState());
});

export default store;

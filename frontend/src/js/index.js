import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter, Route } from 'react-router-dom';

import AppContainer from './containers/AppContainer';

import store from './state/store';

ReactDom.render((
  <Provider store={store}>
    <BrowserRouter>
      <Route path="/" component={AppContainer}>
        {/* <Route path="login" component={LoginContainer}></Route> */}
      </Route>
    </BrowserRouter>
  </Provider>
), document.getElementById('application'));

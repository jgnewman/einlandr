import React from 'react';
import ReactDom from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';

import AppContainer from './containers/AppContainer';

import store from './state/store';

ReactDom.render((
  <Provider store={store}>
    <Router>
      <Route path="/" component={AppContainer}>
        {/* <Route path="login" component={LoginContainer}></Route> */}
      </Route>
    </Router>
  </Provider>
), document.getElementById('application'));

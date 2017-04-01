import React from 'react';
import { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import App from '../components/App';

import * as appActions from '../actions/appActions';
import * as data from '../data/appData';
import * as handlers from '../handlers/appHandlers';

class AppContainer extends Component {
  constructor() {
    super();
  }

  render() {
    const { actions } = this.props;

    return (
      <App
        data={data}
        actions={actions}
        handlers={handlers}
      />
    );
  }
}

/**
 * Returns a collection of props on the component that
 * correspond to values in the redux state.
 */
function select(state) {
  return {};
}

/**
 * Returns a collection of props on the component that
 * are functions that trigger redux actions.
 * All functions exported from the actions file are
 * automatically bound.
 * { foo: bindActionCreators(actions.foo, dispatch) }
 */
function action(dispatch) {
  const actionCreators = {};
  Object.keys(appActions).forEach(key => {
    actionCreators[key] = bindActionCreators(appActions[key], dispatch);
  });

  // Bind any further actions here...
  // actionCreators.foo = bindActionCreators(foo, dispatch);

  return { actions: actionCreators };
}

export default connect(select, action)(AppContainer);

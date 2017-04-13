import React from 'react';
import { Component } from 'react';
import PropTypes from 'prop-types';

class App extends Component {
  constructor() {
    super()
  }

  render() {
    return (
      <div className="app">
        <h1 className="einlandr-title">EINLANDR</h1>
      </div>
    );
  }
}

App.propTypes = {
  data: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
  handlers: PropTypes.object.isRequired
};

export default App;

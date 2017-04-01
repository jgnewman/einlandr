import React from 'react';
import { Component } from 'react';

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
  data: React.PropTypes.object.isRequired,
  actions: React.PropTypes.object.isRequired,
  handlers: React.PropTypes.object.isRequired
};

export default App;

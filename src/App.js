import React, { Component } from 'react';

import Header from './components/Header';
import Landing from './components/Landing';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
        <Landing/>
      </div>
    );
  }
}

export default App;

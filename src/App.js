import React, { Component } from 'react';
  
import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import Music from './components/Music';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
        <Landing/>
        <About/>
        <Music/>
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
  
import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import Music from './components/Music';
import SideProjects from './components/SideProjects';
// import SideProjects from './components/SideProjects2';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
        <Landing/>
        <About/>
        <Music/>
        <SideProjects/>
      </div>
    );
  }
}

export default App;

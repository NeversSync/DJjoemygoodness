import React, { Component } from 'react';
import styled from 'styled-components';

import './styles/boss.css';
import './styles/App.css';
import Header from './components/Header';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Header/>
      </div>
    );
  }
}

export default App;

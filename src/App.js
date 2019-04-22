import React, { Component } from 'react';
  
import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import Music from './components/Music';
import SideProjects from './components/SideProjects';
// import SideProjects from './components/SideProjects2';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverLink: 'HOME',
      activeLink: 'HOME'
    };
    this.handleKnobClick = this.handleKnobClick.bind(this);
    this.handleKnobLinkHover = this.handleKnobLinkHover.bind(this);
  }

  handleKnobLinkHover = hoveredLink => {
    this.setState({ hoverLink: hoveredLink.current.text});
  }

  handleKnobClick = event => {
    event.preventDefault();

    //TODO:  Make event target become active link in state, change color, change rotation on the transform. Pass this as props to both nav knobs. 

    // STEPS
    // On click, scroll down page to section. 
    // Pushstate with history and router to change url


  };

  render() {
    return (
      <div className="App">
        <Header hoverLink={this.state.hoverLink} activeLink={this.state.activeLink} handleKnobLinkHover={this.handleKnobLinkHover} handleKnobClick={this.handleKnobClick} />
        <Landing hoverLink={this.state.hoverLink} activeLink={this.state.activeLink} handleKnobLinkHover={this.handleKnobLinkHover} handleKnobClick={this.handleKnobClick}/>
        <About/>
        <Music/>
        <SideProjects/>
      </div>
    );
  }
}

export default App;

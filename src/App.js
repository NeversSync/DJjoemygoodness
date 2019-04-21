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
      activeLink: 'HOME',
      currentRotation: 'rotate(-90deg)'
    };
    this.handleKnobClick = this.handleKnobClick.bind(this);
  }

  handleKnobLinkHover = link => {
    // on link hover trigger event that changes activehoverlink in app state
    // Pass activelink down to both knob components
    // Change rotation of knob based on activelink in css
    console.log('hover', link);
    this.setState({ hoverLink: link.current.text});
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
        <Header activeLink={this.state.activeLink} currentRotation={this.state.currentRotation} handleKnobClick={this.handleKnobClick} />
        <Landing hoverLink={this.state.hoverLink} activeLink={this.state.activeLink} currentRotation={this.state.currentRotation} handleKnobLinkHover={this.handleKnobLinkHover} handleKnobClick={this.handleKnobClick}/>
        <About/>
        <Music/>
        <SideProjects/>
      </div>
    );
  }
}

export default App;

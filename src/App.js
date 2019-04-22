import React, { Component } from 'react';
  
import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import Music from './components/Music';
import SideProjects from './components/SideProjects';
// import SideProjects from './components/SideProjects2';

// TODO
// CHange color of active link in both knob navs
// Close nav page when click happens

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
    this.setState({ hoverLink: hoveredLink.target.textContent});
  }
  
  handleKnobClick = event => {
    event.preventDefault();
    console.log('event', event, 'state', this.state.activeLink);
    this.setState({ activeLink: event.target.textContent});
    //TODO:  

  };

  render() {
    return (
      <div className="App">
        <Header hoverLink={this.state.hoverLink} activeLink={this.state.activeLink} handleKnobLinkHover={this.handleKnobLinkHover} handleKnobClick={this.handleKnobClick} />
        <Landing hoverLink={this.state.hoverLink} activeLink={this.state.activeLink} handleKnobLinkHover={this.handleKnobLinkHover} handleKnobClick={this.handleKnobClick}/>
        <About />
        <Music />
        <SideProjects />
      </div>
    );
  }
}

export default App;

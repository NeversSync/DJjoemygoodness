import React, { Component } from 'react';

import Header from './components/Header';
import Landing from './components/Landing';
import About from './components/About';
import Music from './components/Music';
import SideProjects from './components/SideProjects';
import Booking from './components/Booking';
import Footer from './components/Footer';

// TODO: connect contact form to email.

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
    this.setState({ activeLink: event.target.textContent });
  };

  render() {
    return (
      <div className="App" id="top">
        <Header hoverLink={this.state.hoverLink} activeLink={this.state.activeLink} handleKnobLinkHover={this.handleKnobLinkHover} handleKnobClick={this.handleKnobClick} />
        <Landing hoverLink={this.state.hoverLink} activeLink={this.state.activeLink} handleKnobLinkHover={this.handleKnobLinkHover} handleKnobClick={this.handleKnobClick}/>
        <About />
        <Music />
        <SideProjects />
        <Booking />
        <Footer/>
      </div>
    );
  }
}

export default App;

import React, { Component } from 'react';
import Layout from '../components/layout';
import Header from '../components/Header';
import Landing from '../components/Landing';
import About from '../components/About';
import Music from '../components/Music';
import SideProjects from '../components/SideProjects';
import Booking from '../components/Booking';
import Footer from '../components/Footer';
import {
  hashFromHref,
  labelFromKnobEvent,
  scrollToSection,
} from '../lib/sectionNav';

if (typeof window !== 'undefined') {
  // eslint-disable-next-line global-require
  require('smooth-scroll')('a[href*="#"]');
}

class IndexPage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hoverLink: 'HOME',
      activeLink: 'HOME',
    };
    this.handleKnobClick = this.handleKnobClick.bind(this);
    this.handleKnobLinkHover = this.handleKnobLinkHover.bind(this);
  }

  handleKnobLinkHover = (hoveredLink) => {
    const label = (hoveredLink.target.textContent || '').trim();
    if (label) {
      this.setState({ hoverLink: label });
    }
  };

  handleKnobClick = (event) => {
    event.preventDefault();
    const label = labelFromKnobEvent(event);
    const hash = hashFromHref(event.currentTarget.getAttribute('href'));

    if (label) {
      this.setState({ activeLink: label, hoverLink: label });
    }

    if (typeof window !== 'undefined') {
      scrollToSection(hash);
    }
  };

  render() {
    return (
      <Layout>
        <div className="App" id="top">
          <Header
            hoverLink={this.state.hoverLink}
            activeLink={this.state.activeLink}
            handleKnobLinkHover={this.handleKnobLinkHover}
            handleKnobClick={this.handleKnobClick}
          />
          <Landing
            hoverLink={this.state.hoverLink}
            activeLink={this.state.activeLink}
            handleKnobLinkHover={this.handleKnobLinkHover}
            handleKnobClick={this.handleKnobClick}
          />
          <About />
          <Music />
          <SideProjects />
          <Booking />
          <Footer
            hoverLink={this.state.hoverLink}
            activeLink={this.state.activeLink}
            handleKnobLinkHover={this.handleKnobLinkHover}
            handleKnobClick={this.handleKnobClick}
          />
        </div>
      </Layout>
    );
  }
}

export default IndexPage;

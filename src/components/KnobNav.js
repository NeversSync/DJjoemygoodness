import React, { Component } from "react";
import {
  Knob,
  KnobNavLink1,
  KnobNavLink2,
  KnobNavLink3,
  KnobNavLink4,
  KnobNavLink5
} from '../styles/knob-styles';

class KnobNav extends Component {
  constructor(props) {
    super(props);
    // create a ref to store the textInput DOM element
    this.navLinkHome = React.createRef();
    this.navLinkAbout = React.createRef();
    this.navLinkMusic = React.createRef();
    this.navLinkSideProjects = React.createRef();
    this.navLinkBooking = React.createRef();
  }

  render() {
    return (
      <Knob
        hoverLink={this.props.hoverLink}
        activeLink={this.props.activeLink}
        currentRotation={this.props.currentRotation}
      >
        <KnobNavLink1
          href="/"
          ref={this.navLinkHome}
          onMouseOver={e => this.props.handleKnobLinkHover(this.navLinkHome)}
          onClick={this.props.handleKnobClick}
        >
          <h3>HOME</h3>
        </KnobNavLink1>
        <KnobNavLink2
          href="/"
          ref={this.navLinkAbout}
          onMouseOver={e => this.props.handleKnobLinkHover(this.navLinkAbout)}
          onClick={this.props.handleKnobClick}
        >
          <h3>ABOUT</h3>
        </KnobNavLink2>
        <KnobNavLink3
          href="/"
          ref={this.navLinkMusic}
          onMouseOver={e => this.props.handleKnobLinkHover(this.navLinkMusic)}
          onClick={this.props.handleKnobClick}
        >
          <h3>MUSIC</h3>
        </KnobNavLink3>
        <KnobNavLink4 href="/"
          ref={this.navLinkSideProjects}
          onMouseOver={e => this.props.handleKnobLinkHover(this.navLinkSideProjects)}>

          <h3>SIDE PROJECTS</h3>
        </KnobNavLink4>
        <KnobNavLink5 href="/" ref={this.navLinkBooking}
          onMouseOver={e => this.props.handleKnobLinkHover(this.navLinkBooking)}>
          <h3>BOOKING</h3>
        </KnobNavLink5>
        <span className="min">Min</span>
        <span className="max">Max</span>
        <div className="ticks">
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick activetick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
          <div className="tick" />
        </div>
      </Knob>
    );
  }
}

export default KnobNav;

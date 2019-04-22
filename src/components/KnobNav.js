import React, { Component } from 'react';
import styled from 'styled-components';
import {
  KnobNavLink1,
  KnobNavLink2,
  KnobNavLink3,
  KnobNavLink4,
  KnobNavLink5
} from '../styles/knob-styles';

const Knob = styled.div`
  display: grid;
  justify-self: center;
  align-self: center;
  position: relative;
  width: 150px;
  height: 150px;
  background-color: #6b6b6b;
  border-radius: 50%;
  box-shadow: inset -2px 2px 0px 0px rgba(255, 255, 255, 0.1),
    inset 2px -2px 0px 0px rgba(17, 17, 17, 0.2), -5px 5px 5px 0px #111,
    -10px 10px 10px -5px #111, -20px 20px 20px -10px #111,
    -25px 25px 25px -10px #111;

  @media (min-width: 1200px) {
    width: 250px;
    height: 250px;
  }

  &::after {
    position: absolute;
    top: 50%;
    left: 75%;
    width: 25%;
    height: 4px;
    margin-top: -2px;
    background-color: var(--link-color);
    box-shadow: 0 0 5px 5px hsla(204, 45%, 62%, 0.15);
    border-radius: 2px;
    transition: all 200ms ease-in-out;
    transform-origin: -100% 50%;
    content: "";
  }
`;

class KnobNav extends Component {
  constructor(props) {
    super(props);
    this.navLinkHome = React.createRef();
    this.navLinkAbout = React.createRef();
    this.navLinkMusic = React.createRef();
    this.navLinkSideProjects = React.createRef();
    this.navLinkBooking = React.createRef();
  }

  render() {
    let currentClass;
    let activeTickGroup = [];
    activeTickGroup.length = 12;

    if (this.props.hoverLink === 'HOME') {
      currentClass = 'home-rotate';
      activeTickGroup.length = 12;
    } else if (this.props.hoverLink === 'ABOUT') {
      currentClass = 'about-rotate';
      activeTickGroup.length = 14;
    } else if (this.props.hoverLink === 'MUSIC') {
      currentClass = 'music-rotate';
      activeTickGroup.length = 16;
    } else if (this.props.hoverLink === 'SIDE PROJECTS') {
      currentClass = 'sideprojects-rotate';
      activeTickGroup.length = 18;
    } else if (this.props.hoverLink === 'BOOKING') {
      currentClass = 'booking-rotate';
      activeTickGroup.length = 20;
    }

    return (
      <Knob
        hoverLink={this.props.hoverLink}
        activeLink={this.props.activeLink}
        className={currentClass}
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
        <KnobNavLink4
          href="/"
          ref={this.navLinkSideProjects}
          onMouseOver={e =>
            this.props.handleKnobLinkHover(this.navLinkSideProjects)
          }
        >
          <h3>SIDE PROJECTS</h3>
        </KnobNavLink4>
        <KnobNavLink5
          href="/"
          ref={this.navLinkBooking}
          onMouseOver={e => this.props.handleKnobLinkHover(this.navLinkBooking)}
        >
          <h3>BOOKING</h3>
        </KnobNavLink5>
        <span className="min">Min</span>
        <span className="max">Max</span>
        <div className="ticks">
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length === !12 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length < 14 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length < 14 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length < 16 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length < 16 ? 'tick' : 'tick activetick'}
          />
          <div className={activeTickGroup.length < 18 ? 'tick' : 'tick activetick'} />
          <div className={activeTickGroup.length < 18 ? 'tick' : 'tick activetick'} />
          <div className={activeTickGroup.length < 20 ? 'tick' : 'tick activetick'} />
          <div className={activeTickGroup.length < 20 ? 'tick' : 'tick activetick'} />
          <div className='tick' />
          <div className='tick' />
          <div className='tick' />
          <div className='tick' />
          <div className='tick' />
        </div>
      </Knob>
    );
  }
}

export default KnobNav;

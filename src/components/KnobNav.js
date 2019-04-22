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
    content: '';
  }
`;

class KnobNav extends Component {
  render() {
    let currentKnobClass;
    let activeTickGroup = [];
    activeTickGroup.length = 12;

    if (this.props.hoverLink === 'HOME') {
      currentKnobClass = 'home-rotate';
      activeTickGroup.length = 12;
    } else if (this.props.hoverLink === 'ABOUT') {
      currentKnobClass = 'about-rotate';
      activeTickGroup.length = 14;
    } else if (this.props.hoverLink === 'MUSIC') {
      currentKnobClass = 'music-rotate';
      activeTickGroup.length = 16;
    } else if (this.props.hoverLink === 'SIDE PROJECTS') {
      currentKnobClass = 'sideprojects-rotate';
      activeTickGroup.length = 18;
    } else if (this.props.hoverLink === 'BOOKING') {
      currentKnobClass = 'booking-rotate';
      activeTickGroup.length = 20;
    }

    return (
      <Knob className={currentKnobClass}>
        <KnobNavLink1 smooth to='/#home' onClick={this.props.handleKnobClick} className={this.props.activeLink === 'HOME' ? 'active-link' : ''}>
          <h3 onMouseOver={this.props.handleKnobLinkHover}>HOME</h3>
        </KnobNavLink1>
        <KnobNavLink2 smooth to='/#about' onClick={this.props.handleKnobClick} className={this.props.activeLink === 'ABOUT' ? 'active-link' : ''}>
          <h3 onMouseOver={this.props.handleKnobLinkHover}>ABOUT</h3>
        </KnobNavLink2>
        <KnobNavLink3 smooth to='/#music' onClick={this.props.handleKnobClick} className={this.props.activeLink === 'MUSIC' ? 'active-link' : ''}>
          <h3 onMouseOver={this.props.handleKnobLinkHover}>MUSIC</h3>
        </KnobNavLink3>
        <KnobNavLink4 smooth to='/#side-projects' onClick={this.props.handleKnobClick} className={this.props.activeLink === 'SIDE PROJECTS' ? 'active-link' : ''}>
          <h3 onMouseOver={this.props.handleKnobLinkHover}>SIDE PROJECTS</h3>
        </KnobNavLink4>
        <KnobNavLink5 smooth to='/#booking' onClick={this.props.handleKnobClick} className={this.props.activeLink === 'BOOKING' ? 'active-link' : ''}>
          <h3 onMouseOver={this.props.handleKnobLinkHover}>BOOKING</h3>
        </KnobNavLink5>
        <span className='min'>Min</span>
        <span className='max'>Max</span>
        <div className='ticks'>
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
          />
          <div
            className={
              activeTickGroup.length === !12 ? 'tick' : 'tick activetick'
            }
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
          <div
            className={activeTickGroup.length < 18 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length < 18 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length < 20 ? 'tick' : 'tick activetick'}
          />
          <div
            className={activeTickGroup.length < 20 ? 'tick' : 'tick activetick'}
          />
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

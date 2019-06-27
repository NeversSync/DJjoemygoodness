import React, { Component } from 'react';
import {
  Knob,
  KnobNavLink1,
  KnobNavLink2,
  KnobNavLink3,
  KnobNavLink4,
  KnobNavLink5
} from '../styles/knob-styles';

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
        <KnobNavLink1
          to='/#home'
          onClick={this.props.handleKnobClick}
          className={this.props.activeLink === 'HOME' ? 'active-link' : ''}
        >
          <h3 onMouseOver={this.props.handleKnobLinkHover}>HOME</h3>
        </KnobNavLink1>
        <KnobNavLink2
          to='/#about'
          onClick={this.props.handleKnobClick}
          className={this.props.activeLink === 'ABOUT' ? 'active-link' : ''}
        >
          <h3 onMouseOver={this.props.handleKnobLinkHover}>ABOUT</h3>
        </KnobNavLink2>
        <KnobNavLink3
          to='/#music'
          onClick={this.props.handleKnobClick}
          className={this.props.activeLink === 'MUSIC' ? 'active-link' : ''}
        >
          <h3 onMouseOver={this.props.handleKnobLinkHover}>MUSIC</h3>
        </KnobNavLink3>
        <KnobNavLink4
          to='/#side-projects'
          onClick={this.props.handleKnobClick}
          className={
            this.props.activeLink === 'SIDE PROJECTS' ? 'active-link' : ''
          }
        >
          <h3 onMouseOver={this.props.handleKnobLinkHover}>SIDE PROJECTS</h3>
        </KnobNavLink4>
        <KnobNavLink5
          to='/#booking'
          onClick={this.props.handleKnobClick}
          className={this.props.activeLink === 'BOOKING' ? 'active-link' : ''}
        >
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

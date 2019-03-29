import React from 'react';
import { Knob, KnobNavLink1, KnobNavLink2, KnobNavLink3, KnobNavLink4, KnobNavLink5 } from '../styles/landing-styles';

const KnobNav = () => (
  <Knob>
    <KnobNavLink1 href="/"><h3>HOME</h3></KnobNavLink1>
    <KnobNavLink2 href="/"><h3>ABOUT</h3></KnobNavLink2>
    <KnobNavLink3 href="/"><h3>MUSIC</h3></KnobNavLink3>
    <KnobNavLink4 href="/"><h3>SIDE PROJECTS</h3></KnobNavLink4>
    <KnobNavLink5 href="/"><h3>BOOKING</h3></KnobNavLink5>
    <span className="min">Min</span>
    <span className="max">Max</span>
    <div className="ticks">
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick activetick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
      <div className="tick"></div>
    </div>
  </Knob>
);

export default KnobNav;
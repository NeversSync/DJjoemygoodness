import React from 'react';

import { LandingWrapper, LandingImageWrapper, LandingImage, KnobNav, Knob } from '../styles/landing-styles';

const Landing = () => {
  return (
    <LandingWrapper>
      <LandingImageWrapper>
        {/* <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto/v1553307972/joe-good/joe-good-landing.png' alt='joe-good-image'/> */}
        <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553310140/joe-good/djjoemygoodnesssticker9.png' alt='joe-good-image' />
      </LandingImageWrapper>
      <KnobNav>
        <Knob>
          <span class="min">Min</span>
          <span class="max">Max</span>
          <div class="ticks">
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick activetick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
            <div class="tick"></div>
          </div>
        </Knob>
      </KnobNav>
    </LandingWrapper>
  );
};

export default Landing;
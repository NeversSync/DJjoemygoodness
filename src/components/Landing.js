import React from 'react';
import KnobNav from './KnobNav';
import { LandingKnobNavWrapper, LandingWrapper, LandingImageWrapper, LandingImage } from '../styles/landing-styles';

const Landing = () => (
  <LandingWrapper>
    <LandingImageWrapper>
      {/* <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto/v1553307972/joe-good/joe-good-landing.png' alt='joe-good-image'/> */}
      <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553310140/joe-good/djjoemygoodnesssticker9.png' alt='joe-good-image' />
    </LandingImageWrapper>
    <LandingKnobNavWrapper>
      <KnobNav />
    </LandingKnobNavWrapper>
  </LandingWrapper>
);

export default Landing;
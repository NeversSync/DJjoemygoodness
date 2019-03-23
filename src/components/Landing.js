import React from 'react';

import { LandingWrapper, LandingImageWrapper, LandingImage, KnobNav, KnobImgWrapper, KnobImg } from '../styles/landing-styles';

const Landing = () => {
  return (
    <LandingWrapper>
      <LandingImageWrapper>
        {/* <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto/v1553307972/joe-good/joe-good-landing.png' alt='joe-good-image'/> */}
        <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553310140/joe-good/djjoemygoodnesssticker9.png' alt='joe-good-image'/>
      </LandingImageWrapper>
      <KnobNav>
        <KnobImgWrapper>
          <KnobImg src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553310342/joe-good/knob2.png' alt='knob'/>
        </KnobImgWrapper>
      </KnobNav>
    </LandingWrapper>
  );
};

export default Landing;
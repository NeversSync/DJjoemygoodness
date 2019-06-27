import React, { Component } from 'react';
import KnobNav from './KnobNav';
import {
  LandingKnobNavWrapper,
  LandingWrapper,
  LandingImageWrapper, LandingImage
} from '../styles/landing-styles';

class Landing extends Component {
  render() {
    return (
      <LandingWrapper id='home'>
        <LandingImageWrapper>
          <LandingImage
            src="https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_100/v1553989428/joe-good/djjoemygoodnesssticker-transparent.png"
          />
          {/* <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto/v1553307972/joe-good/joe-good-landing.png' alt='joe-good-image'/> */}
          {/* <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553310140/joe-good/djjoemygoodnesssticker9.png' alt='joe-good-image' /> */}
          {/* <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553987194/joe-good/TwerkDuSoleil.jpg' style={{borderRadius: '0px'}} /> */}
        </LandingImageWrapper>
        <LandingKnobNavWrapper>
          <KnobNav
            hoverLink={this.props.hoverLink}
            activeLink={this.props.activeLink}
            handleKnobLinkHover={this.props.handleKnobLinkHover}
            handleKnobClick={this.props.handleKnobClick}/>
        </LandingKnobNavWrapper>
      </LandingWrapper>
    );
  }
}

export default Landing;

import React, { Component } from 'react';
import KnobNav from './KnobNav';
import {
  LandingKnobNavWrapper,
  LandingWrapper,
  LandingImageWrapper
} from '../styles/landing-styles';
import { Image } from './Helpers';

// const LandingVideo = '../public/assets/425-1080.mp4';
// const LandingVideo = '../public/assets/cici.mp4';
// const LandingVideo = 'https://www.youtube.com/watch?v=X3M2Ox0ueD8';

class Landing extends Component {
  render() {
    console.log(this.props);
    return (
      <LandingWrapper>
        <LandingImageWrapper>
          <Image
            src="https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_100/v1553989428/joe-good/djjoemygoodnesssticker-transparent.png"
            style={{ width: '90%' }}
          />
          {/* <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto/v1553307972/joe-good/joe-good-landing.png' alt='joe-good-image'/> */}
          {/* <LandingImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553310140/joe-good/djjoemygoodnesssticker9.png' alt='joe-good-image' /> */}
          {/* <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553987194/joe-good/TwerkDuSoleil.jpg' style={{borderRadius: '0px'}} /> */}
        </LandingImageWrapper>
        <LandingKnobNavWrapper>
          <KnobNav hoverLink={this.props.hoverLink} activeLink={this.props.activeLink} currentRotation={this.props.currentRotation} handleKnobLinkHover={this.props.handleKnobLinkHover} handleKnobClick={this.props.handleKnobClick}/>
        </LandingKnobNavWrapper>
      </LandingWrapper>
    );
  }
}

export default Landing;

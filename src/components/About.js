import React from 'react';

import { AboutCopy, AboutImageWrapper, AboutTitle, AboutWrapper } from '../styles/about-styles';
import { Image } from '../components/Helpers';

const About = () => (
  <AboutWrapper>
    <AboutTitle>ABOUT</AboutTitle>
    <AboutCopy>
      Music. Entertainment. Fun.<br/>
      These are at the core of the being that is JoeMyGoodness. Day jobbing in technical wizardry, Joe devotes his evenings and weekends to the furtherment of his art. Being a DJ is more than a hobby, though. More of an all-consuming passion that manifests in subtle and pleasing blends which capture an audience and transport them to a world of sonic imagination. Having a passion for unique music, both foreign and domestic, Joe has found the ultimate satisfaction in styling new trumpet melodies over new and used electronic bass music. With a goal of universal inclusion, blended with musical in-jokes, you'll soon have the fondest of memories from the JoeMyGoodness show!<br/>
      <br/>
      <a className="custom-link" style={{display: 
      'grid', width: 'fit-content', margin: '0 auto', fontSize: 
    '1.1em'}} href="/">See past experience</a>
    </AboutCopy>
    <AboutImageWrapper>
      {/* <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_100/v1553991676/joe-good/joe-good-landing.png' /> */}
      <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553909946/joe-good/17434742_10210707638280555_8517907456128900133_o.jpg' alt='joe-good-image' />
    </AboutImageWrapper> 
  </AboutWrapper>
);

export default About;
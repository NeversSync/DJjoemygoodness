import React from 'react';
import styled from 'styled-components';

import { ImageWrapper, Image, Wrapper, Copy, SubTitle } from '../components/Helpers';

const AboutWrapper = styled(Wrapper)`
  grid-template-rows: 25vh 25vh 25vh 25vh;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 1em;
  background: url('https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553909945/joe-good/263886_4135360475790_1523658970_n.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;

  &:before {
    content: '';
    background-color: hsla(229, 25%, 40%, .8);
    background-size: cover;
    display: grid;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }
  `;

const AboutTitle = styled(SubTitle)`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  justify-self: end;
  margin-top: 40px;
  margin-right: -30px;
  align-self: start;
  height: fit-content;
  transform: rotate(-90deg);
`;

const AboutCopy = styled(Copy)`
  grid-column: 2 / 4;
  grid-row: 2 / 3;
`;

const AboutImageWrapper = styled(ImageWrapper)`
  grid-column: 1 / -1;
  grid-row: 1 / 2;

  @media(min-width: 1200px) {
   grid-column: 4 / 6; 
   grid-row: 2 / 3;
   width: 100%;
   justify-self: center;
  }
`;

const About = () => (
  <AboutWrapper>
    <AboutTitle>ABOUT</AboutTitle>
    <AboutCopy>
      Music. Entertainment. Fun.<br/>
      These are at the core of the being that is JoeMyGoodness. Day jobbing in technical wizardry, Joe devotes his evenings and weekends to the furtherment of his art. Being a DJ is more than a hobby, though. More of an all-consuming passion that manifests in subtle and pleasing blends which capture an audience and transport them to a world of sonic imagination. Having a passion for unique music, both foreign and domestic, Joe has found the ultimate satisfaction in styling new trumpet melodies over new and used electronic bass music. With a goal of universal inclusion, blended with musical in-jokes, you'll soon have the fondest of memories from the JoeMyGoodness show!<br/>
      <a className="custom-link" style={{display: 
      'grid', width: 'fit-content', margin: '0 auto'}} href="/">See past experience</a>
    </AboutCopy>
    <AboutImageWrapper>
      {/* <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_100/v1553991676/joe-good/joe-good-landing.png' /> */}
      <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553909946/joe-good/17434742_10210707638280555_8517907456128900133_o.jpg' alt='joe-good-image' />
    </AboutImageWrapper> 
  </AboutWrapper>
);

export default About;
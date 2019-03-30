import React from 'react';
import styled from 'styled-components';

import { ImageWrapper, Image, Wrapper, Copy, SubTitle } from '../components/Helpers';

const AboutWrapper = styled(Wrapper)`
  background-color: hsla(229, 79%, 58%, 1);
  grid-template-rows: 25vh 25vh 25vh 25vh;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 1em;
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
   align-self: start;
  }
`;

const About = () => (
  <AboutWrapper>
    <AboutTitle>ABOUT</AboutTitle>
    <AboutCopy>
      Music. Entertainment. Fun.<br/>
      These are at the core of the being that is JoeMyGoodness. Day jobbing in technical wizardry, Joe devotes his evenings and weekends to the furtherment of his art. Being a DJ is more than a hobby, though. More of an all-consuming passion that manifests in subtle and pleasing blends which capture an audience and transport them to a world of sonic imagination. Having a passion for unique music, both foreign and domestic, Joe has found the ultimate satisfaction in styling new trumpet melodies over new and used electronic bass music. With a goal of universal inclusion, blended with musical in-jokes, you'll soon have the fondest of memories from the JoeMyGoodness show!
    </AboutCopy>
    <AboutImageWrapper>
      <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553909946/joe-good/17434742_10210707638280555_8517907456128900133_o.jpg' />
      {/* <AboutImage src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553310140/joe-good/djjoemygoodnesssticker9.png' alt='joe-good-image' /> */}
    </AboutImageWrapper>
  </AboutWrapper>
);

export default About;
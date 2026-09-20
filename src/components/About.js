import React from 'react';
import Link from 'next/link';

import { AboutCopy, AboutImageWrapper, AboutTitle, AboutWrapper } from '../styles/about-styles';
import { Image } from '../components/Helpers';

const About = () => (
  <AboutWrapper id="about">
    <AboutTitle>ABOUT</AboutTitle>
    <AboutCopy>
      Music. Entertainment. Fun.
      <br />
      These are at the core of the being that is JoeMyGoodness. Through
      JoeMyGoodness LLC of Oregon he runs an independent record label and
      releases original work to major platforms—while day-jobbing in technical
      practice spanning test automation, web tool design, robotics, analytics,
      and signal processing. Evenings and weekends go to the art: DJ sets that
      style trumpet melodies over electronic bass, immersive installations, and
      ongoing projects like Equilateral Expedition. With a goal of universal
      inclusion, blended with musical in-jokes, you&apos;ll soon have the fondest
      of memories from the JoeMyGoodness show!
      <br />
      <br />
      <Link
        className="custom-link"
        href="/past-experience"
        style={{
          display: 'grid',
          width: 'fit-content',
          margin: '0 auto',
          fontSize: '1.1em',
        }}
      >
        See past experience
      </Link>
    </AboutCopy>
    <AboutImageWrapper>
      <Image
        src="https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553909946/joe-good/17434742_10210707638280555_8517907456128900133_o.jpg"
        alt="Joe My Goodness"
      />
    </AboutImageWrapper>
  </AboutWrapper>
);

export default About;

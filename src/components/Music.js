import React from 'react';
import styled from 'styled-components';

import { ImageWrapper, Image, Wrapper, Card, Copy, SubTitle } from '../components/Helpers';

const MusicWrapper = styled(Wrapper)`
  background-color: #12123B;
  grid-template-rows: 25vh 25vh 25vh 25vh;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 1em;
`;

const MusicTitle = styled(SubTitle)`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  justify-self: end;
  margin-top: 40px;
  margin-right: -30px;
  align-self: start;
  height: fit-content;
  transform: rotate(-90deg);
`;

const MusicCopy = styled(Copy)`
  grid-column: 2 / 4;
  grid-row: 2 / 3;
`;

const MusicImageWrapper = styled(ImageWrapper)`
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

const SoundcloudWrapper = styled(Card)`
  /* box-shadow: 0 15px 35px rgba(50, 50, 93, 0.1), 0 5px 15px rgba(0, 0, 0, 0.07); */
  box-shadow: 5px 5px 15px rgba(255, 255, 255, 0.2);
  grid-column: 1 / -1;
  grid-row: 2 / 3;
  height: 140px;
  /* border: solid white; */
  /* grid-column: 2 / 3; */
  /* grid-row: 2 / 3; */
  /* align-self: flex-end; */
  /* width: 70%; */
  /* margin: 5%; */
  
  @media (min-width: 1200px) {
    grid-column: 2 / 6;
    /* max-width: 85%; */
  }
`;

const Music = () => (
  <MusicWrapper>
    <MusicTitle>MUSIC</MusicTitle>
    {/* <MusicCopy>Music. </MusicCopy> */}
    <SoundcloudWrapper>
      <iframe width="100%" height="100%" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/501989763&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>
    </SoundcloudWrapper>
  </MusicWrapper>
);

export default Music;
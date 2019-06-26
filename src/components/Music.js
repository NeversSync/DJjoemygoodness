import React from 'react';

import InstagramFeed from './InstagramFeed';
import {
  MusicCopy,
  MusicTitle,
  MusicWrapper,
  SoundcloudWrapper,
  MusicYoutubeWrapper
} from '../styles/music-styles';

const Music = () => (
  <div>
    <MusicWrapper id='music'>
      <MusicTitle>MUSIC</MusicTitle>
      <SoundcloudWrapper>
        <iframe
          width='100%'
          height='100%'
          scrolling='no'
          frameBorder='no'
          title='soundcloud mix'
          src='https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/501989763&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true'
        />
      </SoundcloudWrapper>
      <MusicCopy>
        Being a great DJ is about knowing your audience. Years of practice, and
        a willingness to accept feedback have shaped Joe into a truly unique
        style of DJ. Equally comfortable playing for swanky affairs, as for
        outdoor festivals, Joe has a singular mission: To help people enjoy
        themselves. In addition to summers packed with weddings and festivals,
        Joe makes the time to act as the Musical Talent Coordinator for Pacific
        Fire Gathering. In this role, he has constant exposure to every aspect
        of the production process. His experience includes Wedding, Corporate,
        Radio, Club and Festival DJ opportunities.
      </MusicCopy>
      <MusicYoutubeWrapper>
        <iframe
          className='youtube-iframe'
          width='560'
          height='315'
          src='https://www.youtube.com/embed/X3M2Ox0ueD8'
          frameBorder='0'
          allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
          title='music video'
        />
      </MusicYoutubeWrapper>
      <InstagramFeed />
      {/* TODO: fix grid-row of feed */}
    </MusicWrapper>
  </div>
);

export default Music;

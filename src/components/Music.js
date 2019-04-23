import React from 'react';

import { MusicCopy, MusicImageWrapper, MusicTitle, MusicWrapper, SoundcloudWrapper, YoutubeWrapper } from '../styles/music-styles';

const Music = () => (
  <MusicWrapper id='music'>
    <MusicTitle>MUSIC</MusicTitle>
    {/* <MusicCopy>Music. </MusicCopy> */}
    <SoundcloudWrapper>
      <iframe width="100%" height="100%" scrolling="no" frameBorder="no" title="soundcloud mix" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/501989763&color=%23ff5500&auto_play=false&hide_related=false&show_comments=true&show_user=true&show_reposts=false&show_teaser=true&visual=true"></iframe>
    </SoundcloudWrapper>
    <YoutubeWrapper>
      <iframe className='youtube-iframe' width="560" height="315" src="https://www.youtube.com/embed/X3M2Ox0ueD8" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="music video"></iframe>
    </YoutubeWrapper>
  </MusicWrapper>
);

export default Music;
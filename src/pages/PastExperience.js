import React from 'react';
import {
  PastExperienceCopy,
  PastExperienceTitle,
  PastExperienceWrapper, HomeButton
} from '../styles/pastExperience-styles';

const PastExperience = () => (
  <PastExperienceWrapper>
    <PastExperienceTitle>
      Past Experience
    </PastExperienceTitle>
    <PastExperienceCopy>
      <strong>Current:</strong><br/>
      · Pacific Fire Gathering - Music Coordinator - 2012 - Present<br/>
      · Noteworthy DJs - Professional DJ - 2014 - Present <br/><br/>
      <strong>Recent:</strong><br/>
      · Twerk Du Soleil (Dante's) - DJ - 2018-2019<br/> Places - ABD (Seattle) - DJ - 2018<br/>
      · Pacific Fire Gathering (Tillamook) - DJ - 2015-2018<br/>
      · Soak Fire Conclave (Tygh Valley) - Musical Curator - 2018<br/>
      · Muse Ecstatic Dance (Portland) - DJ - 2018<br/>
      · Twerk for Warmth (Pegasus Project - Portland) - DJ - 2018<br/> · Black Rock Boutique (BRC Nevada) - DJ - 2017<br/>
      · Shades EP - Composer - 2017<br/>
      · Prop Gathering (Oregon) - Music Coordinator - 2015 - 2017<br/>
      · Bass & Swing (Portland) - DJ - 2017<br/>
      · Shift Festival (Grass Valley) - DJ - 2016<br/>
      · Crystal Ballroom (Portland) - Musician - 2016<br/>
      · Eclectronic Dawn Radio Show (Freeform Portland) - DJ - 2016<br/>
      <HomeButton to='/'>
        HOME
      </HomeButton>
    </PastExperienceCopy>
  </PastExperienceWrapper>
);

export default PastExperience;

import React from 'react';
import { SideProjectsCopy, SideProjectsYoutubeWrapper, SideProjectsImageWrapper, SideProjectsTitle, SideProjectsWrapper, SideProjectsLink, SideProjectsSubtitle, CuddleFishSubtitle, CuddleFishImageWrapper, CuddleFishCopy } from '../styles/sideprojects-styles';
import { Image } from '../components/Helpers';

// const fireDancingImg = 'http://res.cloudinary.com/nicky-cloudinary/image/upload/dpr_auto,f_auto,q_auto:good/v1519772075/Portfolio/tableau-screen-shot.png';
// const cuddleFishImg = 'http://res.cloudinary.com/nicky-cloudinary/image/upload/s--OqiFZzIy--/dpr_auto,f_auto,q_jpegmini/v1519772080/Portfolio/gong-fu-tea-screenshot.png';
// const atomicFlowImg = 'https://res.cloudinary.com/nicky-cloudinary/image/upload/s--CmYI1J_B--/f_auto,q_jpegmini/v1549568086/Portfolio/enterprise-screenshot.png';


const SideProjects = () => (
  <SideProjectsWrapper id='side-projects'>
    <SideProjectsTitle>SIDE PROJECTS</SideProjectsTitle>
    <SideProjectsSubtitle>Fire Dancing</SideProjectsSubtitle>
    <SideProjectsCopy>
      Everyone enjoys a good fire show. Whether it's a festival, a club, or a church, Atomic Flow can brighten any occasion! Specializing in Partner Poi, Sword, Buugeng, Torches, Staff and Hoop, Atomic Flow are master performers. Enjoy the primal wonder of fire, set to synergistic melodies. Lessons in object manipulation and fire safety available. 
    </SideProjectsCopy>
    <SideProjectsLink className="custom-link" href="https://sites.google.com/site/atomicflowportland/">Learn more about Atomic Flow
    </SideProjectsLink>
    <SideProjectsImageWrapper>
      <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1555986949/joe-good/joe-good-fire2.jpg' alt='joe-good-image' />
    </SideProjectsImageWrapper>
    <SideProjectsYoutubeWrapper>
      <iframe className='youtube-iframe' width="560" height="315"  src="https://www.youtube.com/embed/6QlJfDz7pLU" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="fire video"></iframe>
    </SideProjectsYoutubeWrapper>

    <CuddleFishSubtitle>Cuddlefish Artcar</CuddleFishSubtitle>
    <CuddleFishCopy>
      Cuddly goodness. Everyone enjoys a good fire show. Whether it's a festival, a club, or a church, Atomic Flow can brighten any occasion! Specializing in Partner Poi, Sword, Buugeng, Torches, Staff and Hoop, Atomic Flow are master performers. Enjoy the primal wonder of fire, set to synergistic melodies. Lessons in object manipulation and fire safety available. 
    </CuddleFishCopy>
    <SideProjectsLink className="custom-link" href="https://sites.google.com/site/atomicflowportland/" target="_blank">Learn more about Atomic Flow
    </SideProjectsLink>
    <CuddleFishImageWrapper>
      <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1555993759/joe-good/cuddlefish1.jpg' alt='joe-good-image' />
    </CuddleFishImageWrapper>
    <SideProjectsYoutubeWrapper>
      <iframe className='youtube-iframe' width="560" height="315"  src="https://www.youtube.com/embed/6QlJfDz7pLU" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen title="fire video"></iframe>
    </SideProjectsYoutubeWrapper>
  </SideProjectsWrapper>
);

export default SideProjects;
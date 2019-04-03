import React from 'react';

import { SideProjectsCopy, SideProjectsImageWrapper, SideProjectsTitle, SideProjectsWrapper } from '../styles/sideprojects-styles';
import { Image } from '../components/Helpers';

{/* Fire dancing
Cuddlefish
atomic-flow.com link */}

const SideProjects = () => (
  <SideProjectsWrapper>
    <SideProjectsTitle>SideProjects</SideProjectsTitle>
    <SideProjectsCopy>

      <br />
      <br />
      <a className="custom-link" style={{
        display:
          'grid', width: 'fit-content', margin: '0 auto', fontSize:
          '1.1em'
      }} href="/">Check out this side project</a>
    </SideProjectsCopy>
    <SideProjectsImageWrapper>
      <Image src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553909946/joe-good/17434742_10210707638280555_8517907456128900133_o.jpg' alt='joe-good-image' />
    </SideProjectsImageWrapper>
  </SideProjectsWrapper>
);

export default SideProjects;
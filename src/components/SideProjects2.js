import React, { Component } from 'react';
// import ScrollMagic from 'scrollmagic';

import { SideProjectsWrapper, SideProjectsTitle, ProjectHeader, SubHeader, Project } from '../styles/sideprojects-styles';
import { Image } from '../components/Helpers';

// TODO:
// Fix these projects and add grid/minmax rule for projects. fix animations and links using scroll magic. Clean up style file. 


const fireDancingImg = 'http://res.cloudinary.com/nicky-cloudinary/image/upload/dpr_auto,f_auto,q_auto:good/v1519772075/Portfolio/tableau-screen-shot.png';
const cuddleFishImg = 'http://res.cloudinary.com/nicky-cloudinary/image/upload/s--OqiFZzIy--/dpr_auto,f_auto,q_jpegmini/v1519772080/Portfolio/gong-fu-tea-screenshot.png';
const atomicFlowImg = 'https://res.cloudinary.com/nicky-cloudinary/image/upload/s--CmYI1J_B--/f_auto,q_jpegmini/v1549568086/Portfolio/enterprise-screenshot.png';


class SideProjects extends Component {

  // componentDidMount() {
  //   const controller = new ScrollMagic.Controller();
  //   const animatedProjectComponents = [this.GongFuProject, this.TableauProject, this.PascaleProject];
  //   animatedProjectComponents.forEach(comp => {
  //     new ScrollMagic.Scene({
  //       triggerElement: comp,
  //       triggerHook: .9,
  //       reverse: false
  //     })
  //       .setClassToggle(comp, 'fade-project-in')
  //       .addTo(controller);
  //   });
  // }

  render() {
    return (
      // <div style={{ marginBottom: '40px' }}>
      <SideProjectsWrapper>
        <SideProjectsTitle>SideProjects</SideProjectsTitle>
        <Project>
          {/* innerRef={comp => { this.FireDancingProject = comp; }} className='project-comp' */}
          {/* <a href="https://www.pascalevermont.com/" target="_blank" rel="noopener noreferrer"> */}
          <ProjectHeader>Fire Dancing</ProjectHeader>
          <SubHeader>Spinning fire, etc. etc. etc. </SubHeader>
          <Image src={fireDancingImg} alt='fire dancing' />
          {/* </a> */}
        </Project>
        <Project>
          {/* innerRef={comp => { this.CuddleFishProject = comp; }} className='project-comp' */}
          {/* <a href="https://the-CuddleFish-app.herokuapp.com/" target="_blank" rel="noopener noreferrer"> */}
          <ProjectHeader>CuddleFish Art Car</ProjectHeader>
          <SubHeader>It's a cuddly fish art car!</SubHeader>
          <Image src={cuddleFishImg} alt=''></Image>
          {/* </a> */}
        </Project>
        <Project>
          {/* innerRef={comp => { this.AtomicFlowProject = comp; }} className='project-comp' */}
          <a href="*atomic-flow-link:TODO" target="_blank" rel="noopener noreferrer">
            <ProjectHeader>Atomic Flow</ProjectHeader>
            <SubHeader>Fire spinning and flow arts goodness</SubHeader>
            <Image src={atomicFlowImg} alt=''></Image>
          </a>
        </Project>
      </SideProjectsWrapper>
      // </div>
    );
  }
}
export default SideProjects;
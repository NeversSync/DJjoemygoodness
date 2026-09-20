import React from 'react';
import {
  SideProjectsCopy,
  SideProjectsYoutubeWrapper,
  SideProjectsImageWrapper,
  SideProjectsTitle,
  SideProjectsWrapper,
  SideProjectsLink,
  SideProjectsSubtitle,
  ProjectBlock,
  SkillsList,
  LinkRow,
} from '../styles/sideprojects-styles';
import { Image } from '../components/Helpers';

const TECH_SKILLS = [
  'Test Automation',
  'Web Tool Design',
  'Robotics',
  'Analytics',
  'Signal Processing',
];

const SideProjects = () => (
  <SideProjectsWrapper id="side-projects">
    <SideProjectsTitle>SIDE PROJECTS</SideProjectsTitle>

    <ProjectBlock>
      <SideProjectsSubtitle>Equilateral Expedition</SideProjectsSubtitle>
      <SideProjectsCopy>
        An ongoing audiovisual and engineering practice—where performance,
        geometry, and custom tooling meet. This is where much of Joe’s current
        creative and technical energy lives.
      </SideProjectsCopy>
      <SideProjectsCopy as="div">
        Technical practice includes:
        <SkillsList>
          {TECH_SKILLS.map((skill) => (
            <li key={skill}>{skill}</li>
          ))}
        </SkillsList>
      </SideProjectsCopy>
      <LinkRow>
        <SideProjectsLink
          className="custom-link"
          href="https://www.youtube.com/playlist?list=PLSAGhFyWcKwk"
          target="_blank"
          rel="noopener noreferrer"
        >
          Watch the YouTube playlist
        </SideProjectsLink>
        <SideProjectsLink
          className="custom-link"
          href="https://www.instagram.com/equilateralexpedition/"
          target="_blank"
          rel="noopener noreferrer"
        >
          @equilateralexpedition
        </SideProjectsLink>
      </LinkRow>
      <SideProjectsYoutubeWrapper>
        <iframe
          className="youtube-iframe"
          width="560"
          height="315"
          src="https://www.youtube.com/embed/uzq_yZsplc8"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Equilateral Expedition technical practice"
        />
      </SideProjectsYoutubeWrapper>
    </ProjectBlock>

    <ProjectBlock>
      <SideProjectsSubtitle>Geometric Geodes</SideProjectsSubtitle>
      <SideProjectsCopy>
        Light-installation and geometric art work documented on Instagram—
        luminous forms, material craft, and immersive visual space.
      </SideProjectsCopy>
      <SideProjectsLink
        className="custom-link"
        href="https://www.instagram.com/geometric_geodes/"
        target="_blank"
        rel="noopener noreferrer"
      >
        @geometric_geodes
      </SideProjectsLink>
    </ProjectBlock>

    <ProjectBlock>
      <SideProjectsSubtitle>Atomic Flow</SideProjectsSubtitle>
      <SideProjectsCopy>
        Everyone enjoys a good fire show. Whether it&apos;s a festival, a club,
        or a church, Atomic Flow can brighten any occasion! Specializing in
        Partner Poi, Sword, Buugeng, Torches, Staff and Hoop, Atomic Flow are
        master performers. Enjoy the primal wonder of fire, set to synergistic
        melodies. Lessons in object manipulation and fire safety available.
      </SideProjectsCopy>
      <SideProjectsLink
        className="custom-link"
        href="https://sites.google.com/site/atomicflowportland/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn more about Atomic Flow
      </SideProjectsLink>
      <SideProjectsImageWrapper>
        <Image
          src="https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1555986949/joe-good/joe-good-fire2.jpg"
          alt="Atomic Flow fire performance"
        />
      </SideProjectsImageWrapper>
      <SideProjectsYoutubeWrapper>
        <iframe
          className="youtube-iframe"
          width="560"
          height="315"
          src="https://www.youtube.com/embed/w8Hita6MBsQ"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title="Atomic Flow performance"
        />
      </SideProjectsYoutubeWrapper>
    </ProjectBlock>

    <ProjectBlock>
      <SideProjectsSubtitle>Cuddlefish Artcar</SideProjectsSubtitle>
      <SideProjectsCopy>
        Founded in 2017, The Cuddlefish is a mutant vehicle based in Portland,
        OR. Combining a vintage Hobart airport tug, a 2-axle trailer and
        anatomical drawings of cuttlefish, The Cuddlefish was born. Home to over
        4000 individually addressable LEDs and a 2000 watt sound system, this
        majestic creature measures 30 feet in length and 20 in width.
      </SideProjectsCopy>
      <SideProjectsImageWrapper>
        <Image
          src="https://res.cloudinary.com/nicky-cloudinary/image/upload/v1557267305/joe-good/JoeAndJoshCuddlefish.jpg"
          alt="Cuddlefish artcar"
        />
      </SideProjectsImageWrapper>
    </ProjectBlock>
  </SideProjectsWrapper>
);

export default SideProjects;
export { TECH_SKILLS };

import styled from 'styled-components';
import { Wrapper, SubTitle, ImageWrapper, Copy, Card } from '../components/Helpers';

const SideProjectsWrapper = styled(Wrapper)`
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: 10vh auto auto auto auto 10vh;

  grid-gap: 1em;
  background: url("https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1555986949/joe-good/joe-good-fire2.jpg");
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;

  &:before {
    content: "";
    background-color: var(--orange);
    background-size: cover;
    display: grid;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  @media (min-width: 1200px) {
    grid-template-rows: 15vh auto auto auto auto 15vh;
  }
`;

const SideProjectsTitle = styled(SubTitle)`
  grid-column: 1 / 4;
  grid-row: 2 / 3;
  justify-self: end;
  /* margin-top: 40px; */
  margin-right: -25px;
  align-self: start;
  height: fit-content;
  transform: rotate(-90deg);

  @media (min-width: 1200px) {
    margin-top: 95px;
    margin-right: -10px;
    grid-column: 2 / 3;
    grid-row: 2 / 3;
  }
`;

const SideProjectsCopy = styled(Copy)`
  grid-column: 1 / -1;
  width: 85%;
  grid-row: 3 / 4;
  justify-self: center;
  margin-bottom: 3em;

  @media (min-width: 1200px) {
    grid-column: 7 / 11;
    grid-row: 2 / 3;
    margin-bottom: 0;
    margin-top: 40px;
    justify-self: start;
  }
  `;

const SideProjectsSubtitle = styled(Copy)`
  grid-column: 1 / -1;
  grid-row: 2 / 3;
  justify-self: center;
  align-self: start;
  font-size: 1em;

  @media (min-width: 1200px) {
    font-size: 1.1em;
    grid-column: 7 / 9;
    grid-row: 2 / 3;
    justify-self: start;
  }
`;

const SideProjectsImageWrapper = styled(ImageWrapper)`
  grid-column: 3 / 11;
  grid-row: 2 / 3;
  margin-top: 40px;
  width: 100%;
  justify-self: center;
  align-self: center;

  @media (min-width: 1200px) {
    grid-column: 3 / 7;
    align-self: start;
    grid-row: 2 / 3;
    margin-top: 0px;
    height: fit-content;
    width: 100%;
  }
`;

const SideProjectsYoutubeWrapper = styled(Card)`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  padding-top: 25px;
  height: 0;
  width: 100%;
  align-self: center;
  box-shadow: 5px 5px 15px rgba(255, 255, 255, 0.2);
  grid-column: 3 / 11;
  grid-row: 5 / 6;
  margin: 0 auto;
  
  @media (min-width: 1200px) {
    grid-column: 4 / 10;
    margin: 1% auto;
  }
`;

const SideProjectsLink = styled.a`
  display:grid; 
  width: fit-content; 
  font-size: .8em; 
  grid-column: 1 / -1; 
  grid-row: 3 / 4;
  font-family: 'Rubik', sans-serif; 
  line-height: 22px;
  letter-spacing: 1.5px;
  font-weight: 300;
  margin: 0 auto;
  align-self: end;
  
  @media (min-width: 900px) {
    margin: .5em auto;
    letter-spacing: 1.75px;
    grid-row: 3 / 4;
    font-size: 1em;
    line-height: 26px;
  }
`;


const ProjectSection = styled.div`
  display: grid;
  justify-content: center;
  align-items: center;
  height: 60px;
  font-size: 2.2em;
  color: hsla(187, 5%, 33%, 1);
  /* margin: 0 auto; */
  /* margin: 50px 0px 0px 0px; */

  @media (min-width: 768px) {
    font-size: 2em;
  }
`;

const Project = styled.div`
  display: grid;
  grid-row: 2 / 3;
  padding: 15px;
  padding-top: 5px;
  max-width: 400px;
  background-color: white;
  /* transition: background-color 0.5s cubic-bezier(.25,.8,.25,1), box-shadow 0.5s cubic-bezier(.25,.8,.25,1), opacity 2000ms ease-out, transform 2000ms ease-out;
  opacity: 0;
  transform: translateY(40px); */

  @media (min-width: 960px) {
    &:hover {
      background-color: hsla(187, 90%, 40%, 0.25);
      cursor: pointer;
      box-shadow: 0 14px 28px rgba(0, 0, 0, 0.25),
        0 10px 10px rgba(0, 0, 0, 0.22);
    }
  }

  &:active {
    -webkit-transform: translate(0px, 3px);
    transform: translate(0px, 3px);
    box-shadow: none;
  }
`;

const ProjectHeader = styled.h3`
  color: hsl(187, 40%, 2%);
  text-align: center;
  font-weight: 600;
  margin: 2px;
  color: hsla(187, 5%, 33%, 1);
`;

const SubHeader = styled.h3`
  color: hsla(187, 5%, 33%, 1);
  text-align: center;
  font-size: 0.85em;
  font-weight: 300;
  line-height: 1.6em;
  margin: 2px 0 15px 0;

  @media (min-width: 768px) {
    font-size: 0.75em;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
`;

export {
  SideProjectsCopy,
  SideProjectsYoutubeWrapper,
  SideProjectsLink,
  SideProjectsImageWrapper,
  SideProjectsSubtitle,
  SideProjectsTitle,
  SideProjectsWrapper,
  Wrapper,
  ProjectHeader,
  SubHeader,
  Image,
  Project,
  ProjectSection
};

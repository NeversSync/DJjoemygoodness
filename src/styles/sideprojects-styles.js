import styled from 'styled-components';
import { Wrapper, SubTitle, ImageWrapper, Copy } from '../components/Helpers';

const SideProjectsWrapper = styled(Wrapper)`
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 10vh auto auto auto 10vh;

  grid-gap: 1em;
  background: url("https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553909945/joe-good/263886_4135360475790_1523658970_n.jpg");
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
    grid-template-rows: 15vh auto 15vh;
    /* grid-template-columns: repeat(auto-fill, minmax(100px, 250px)); */
    /* grid-template-rows: 10vh 50vh 10vh; */
  }
`;

const SideProjectsTitle = styled(SubTitle)`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  justify-self: end;
  margin-top: 80px;
  margin-right: -30px;
  align-self: start;
  height: fit-content;
  transform: rotate(-90deg);

  @media (min-width: 1200px) {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
`;

const SideProjectsCopy = styled(Copy)`
  grid-column: 1 / -1;
  width: 85%;
  grid-row: 4 / 5;
  justify-self: center;

  @media (min-width: 1200px) {
    grid-column: 4 / 6;
    grid-row: 2 / 3;
  }
`;

const SideProjectsImageWrapper = styled(ImageWrapper)`
  grid-column: 1 / -1;
  grid-row: 2 / 3;
  width: 60%;
  justify-self: center;

  @media (min-width: 1200px) {
    grid-column: 2 / 4;
    grid-row: 2 / 3;
    height: fit-content;
    width: 100%;
    justify-self: center;
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
  SideProjectsImageWrapper,
  SideProjectsTitle,
  SideProjectsWrapper,
  Wrapper,
  ProjectHeader,
  SubHeader,
  Image,
  Project,
  ProjectSection
};

import styled from 'styled-components';
import {
  Wrapper,
  SubTitle,
  ImageWrapper,
  Copy,
  Card,
} from '../components/Helpers';

const SideProjectsWrapper = styled(Wrapper)`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto;
  justify-items: center;
  gap: 2em;
  padding: 10vh 5% 10vh;
  background: url('https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1555986949/joe-good/joe-good-fire1.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: top;
  background-repeat: no-repeat;

  &:before {
    content: '';
    background-color: hsla(22, 94%, 58%, 0.85);
    display: grid;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  > * {
    position: relative;
    z-index: 1;
  }

  @media (min-width: 1200px) {
    padding: 12vh 8% 12vh;
    gap: 2.5em;
  }
`;

const SideProjectsTitle = styled(SubTitle)`
  justify-self: start;
  margin: 0;
  transform: none;
  letter-spacing: 3px;

  @media (min-width: 1200px) {
    font-size: 1.2em;
  }
`;

const ProjectBlock = styled.article`
  width: 100%;
  max-width: 900px;
  display: grid;
  gap: 0.85em;
`;

const SideProjectsSubtitle = styled(Copy)`
  margin: 0;
  justify-self: start;
  font-size: 1.05em;
  letter-spacing: 2px;
`;

const SideProjectsCopy = styled(Copy)`
  margin: 0;
  width: 100%;
  max-width: 700px;
  justify-self: start;
`;

const SkillsList = styled.ul`
  margin: 0;
  padding-left: 1.25em;
  font-family: 'Rubik', sans-serif;
  letter-spacing: 1px;
  line-height: 1.7;
  color: white;
`;

const SideProjectsImageWrapper = styled(ImageWrapper)`
  width: 100%;
  max-width: 520px;
  justify-self: start;
  margin: 0;
`;

const SideProjectsYoutubeWrapper = styled(Card)`
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 25px;
  height: 0;
  width: 100%;
  box-shadow: 5px 5px 15px rgba(255, 255, 255, 0.2);
`;

const SideProjectsLink = styled.a`
  display: grid;
  width: fit-content;
  font-size: 0.9em;
  font-family: 'Rubik', sans-serif;
  line-height: 22px;
  letter-spacing: 1.5px;
  font-weight: 300;

  @media (min-width: 900px) {
    font-size: 1em;
    letter-spacing: 1.75px;
  }
`;

const LinkRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75em 1.25em;
`;

export {
  SideProjectsCopy,
  SideProjectsYoutubeWrapper,
  SideProjectsLink,
  SideProjectsImageWrapper,
  SideProjectsSubtitle,
  SideProjectsTitle,
  SideProjectsWrapper,
  ProjectBlock,
  SkillsList,
  LinkRow,
};

import styled from 'styled-components';
import { Wrapper, SubTitle, ImageWrapper, Copy } from '../components/Helpers';

const AboutWrapper = styled(Wrapper)`
  grid-template-rows: 10vh auto auto auto 10vh;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;

  grid-gap: 1em;
  background: url('https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto:best/v1553909945/joe-good/263886_4135360475790_1523658970_n.jpg');
  background-size: cover;
  background-attachment: fixed;
  background-position: center;
  background-repeat: no-repeat;

  &:before {
    content: '';
    background-color: hsla(229, 25%, 40%, .8);
    background-size: cover;
    display: grid;
    grid-column: 1 / -1;
    grid-row: 1 / -1;
  }

  @media(min-width: 1200px) {
    grid-template-rows: 10vh auto 10vh;
  }  
  `;

const AboutTitle = styled(SubTitle)`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  justify-self: end;
  margin-top: 40px;
  margin-right: -30px;
  align-self: start;
  height: fit-content;
  transform: rotate(-90deg);

  @media(min-width: 1200px) {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
  }
`;

const AboutCopy = styled(Copy)`
  grid-column: 1 / -1;
  width: 85%;
  grid-row: 4 / 5;
  justify-self: center;

  @media(min-width: 1200px) {
    grid-column: 2 / 4;
    grid-row: 2 / 3;
  }
`;

const AboutImageWrapper = styled(ImageWrapper)`
  grid-column: 1 / -1;
  grid-row: 2 / 3;
  width: 60%;
  justify-self: center;

  @media(min-width: 1200px) {
   grid-column: 4 / 6; 
   grid-row: 2 / 3;
   height: fit-content;
   width: 100%;
   justify-self: center;
  }
`;

export { AboutCopy, AboutImageWrapper, AboutTitle, AboutWrapper };
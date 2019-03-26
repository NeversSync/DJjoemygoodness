import styled from 'styled-components';
import { ImageWrapper, Wrapper } from '../components/Helpers';

const LandingWrapper = styled(Wrapper)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: auto 40vh;
`;

const LandingImageWrapper = styled(ImageWrapper)`
  display: grid; 
  grid-column: 1 / -1;
  grid-row: 1 / 2;

  @media(min-width: 900px) {
   grid-column: 1 / 2; 
  }
`;

const LandingImage = styled.img`
  display: grid;
  width: 100%;
`;

const KnobNav = styled.div`
  display: grid;
  grid-column: 1 / -1;
  grid-row: 2 / 3;
  background-color: hsla(0, 0%, 16%, 1);

  @media(min-width: 900px) {
   grid-column: 2 / 3; 
   grid-row: 1 / 2;
  }
`;

const Knob = styled.div`
  display: grid;
  justify-self: center;
  align-self: center;
  position: relative;
  width: 250px;
  height: 250px;
  background-color: #6b6b6b;
  border-radius: 50%;
  box-shadow: inset -2px 2px 0px 0px rgba(255, 255, 255, .1),
              inset 2px -2px 0px 0px rgba(17, 17, 17, .2),
              -5px 5px 5px 0px #111,
              -10px 10px 10px -5px #111,
              -20px 20px 20px -10px #111,
              -25px 25px 25px -10px #111;
  
  &::after {
    position: absolute;
    top: 50%;
    left: 75%;
    width: 25%;
    height: 4px;
    margin-top: -2px;
    background-color: #a8d8f8;
    box-shadow: 0 0 5px 5px hsla(204, 45%, 62%, .15);
    border-radius: 2px;
    transition: all 200ms ease-in-out;
    transform: rotate(-90deg);
    transform-origin: -100% 50%;
    content: "";
  }
`;

export { LandingWrapper, LandingImageWrapper, LandingImage, KnobNav, Knob };
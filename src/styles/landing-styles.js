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
  background-color: hsla(0, 0%, 7%, 100%);

  @media(min-width: 900px) {
   grid-column: 2 / 3; 
   grid-row: 1 / 2;
  }
`;

const KnobImgWrapper = styled(ImageWrapper)`
  display: grid; 
  /* grid-column: 1 / -1; */
  /* grid-row: 1 / 2; */
`;

const KnobImg = styled.img`
  display: grid;
  width: 30%;
  justify-self: center;
  align-self: center;
`;

export { LandingWrapper, LandingImageWrapper, LandingImage, KnobNav, KnobImgWrapper, KnobImg };
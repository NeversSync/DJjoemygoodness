import styled from 'styled-components';
import { Card } from '../components/Helpers';

const InstaFeedContainer = styled(Card)`
  display: grid;
  margin-top: 1.5em;
  padding: .5em;
  padding-bottom: 1.5em;
  box-shadow: 5px 5px 15px rgba(255, 255, 255, 0.2);
  /* background: linear-gradient(hsla(from center, 240, 53%, 15%, .8), hsla(240, 53%, 15%, .5)); */
  background: radial-gradient(hsla(240, 20%, 40%, .9), hsla(240, 53%, 15%, .8));

  @media (min-width: 1200px) {
    grid-column: 4 / 10;
    grid-row: 5 / 6;
    /* justify-self: center; */
    /* margin: 0 10%; */
  }
`;

const InstaTitleWrapper = styled.div`
  display: grid;
  grid-column: 1 / -1;
  justify-items: center;
  align-content: center;
  grid-gap: .5em;
  padding: 1em;
`;

const InstaFeedImagesWrapper = styled(Card)`
  display: grid;
  /* margin-top: .5em; */
  grid-template-columns: 1fr 1fr 1fr;

  @media (min-width: 1200px) {
    /* grid-column: 4 / 10; */
    /* grid-row: 5 / 6; */
    /* justify-self: center; */
    /* margin: 0 10%; */
  }
`;


const InstaImageWrapper = styled(Card)`
  display: grid;
  margin: .2em;
  transition: all 200ms ease-in-out;

  :hover {
    box-shadow: none;
  }

  @media (min-width: 1200px) {
    :hover {
      box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1), 0 3px 8px rgba(255, 255, 255, 0.05);
    }
  }
`;


export { InstaFeedImagesWrapper, InstaFeedContainer, InstaImageWrapper, InstaTitleWrapper };

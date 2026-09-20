import styled from 'styled-components';
import { Card } from '../components/Helpers';

const InstaFeedContainer = styled(Card)`
  display: grid;
  padding: 0.25em;
  padding-bottom: 0.5em;
  box-shadow: 5px 5px 15px rgba(255, 255, 255, 0.2);
  background: radial-gradient(hsla(240, 20%, 40%, 0.9), hsla(240, 53%, 15%, 0.8));
  width: 100%;
  justify-self: center;

  @media (min-width: 1200px) {
    margin-top: 0.5em;
    padding: 0.5em;
    padding-bottom: 1.5em;
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
  grid-template-columns: 1fr;

  @media (min-width: 1200px) {
    grid-template-columns: 1fr 1fr 1fr;
  }
`;


const InstaImageWrapper = styled(Card)`
  display: grid;
  margin: .3em;
  transition: all 200ms ease-in-out;

  :hover {
    box-shadow: none;
  }

  @media (min-width: 1200px) {
    margin: .2em;

    :hover {
      box-shadow: 0 5px 15px rgba(255, 255, 255, 0.1), 0 3px 8px rgba(255, 255, 255, 0.05);
    }
  }
`;


export { InstaFeedImagesWrapper, InstaFeedContainer, InstaImageWrapper, InstaTitleWrapper };

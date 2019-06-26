import styled from 'styled-components';
import { Card } from '../components/Helpers';

const InstaFeedWrapper = styled.div`
  display: grid;
  padding: 15vw;
  grid-template-columns: 1fr 1fr 1fr;
  /* width: 100px; */
`;

// const Card = styled.div`
//   display: grid;
//   box-shadow: 0 5px 15px rgba(50, 50, 93, 0.1), 0 3px 8px rgba(0, 0, 0, 0.07);
//   background: hsla(23, 17%, 19%, 0.6);
//   border: solid 1px white;
//   width: 100%;
//   padding: 2vw;
//   border-radius: 4px;
//   text-align: center;

//   @media(min-width: 900px) {
//     /* width: 60vw; */
//   }
//   `;

const InstaImageWrapper = styled(Card)`
  display: grid;
  /* grid-column: ; */
`;

export { InstaFeedWrapper, InstaImageWrapper };

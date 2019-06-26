import styled from 'styled-components';
import { Card } from '../components/Helpers';

// const InstaFeedWrapper = styled.div`
//   display: grid;
//   padding: 15vw;
//   grid-template-columns: 1fr 1fr 1fr;
//   grid-column: 1 / -1;
//   grid-row: 3 / 4;
//   width: 85%;
//   justify-self: center;

//   @media(min-width: 1200px) {
//     grid-column: 3 / 11;
//     grid-row: 4 / 5;
//     max-width: 700px;
//   }
//   /* width: 100px; */
// `;
const InstaFeedWrapper = styled(Card)`
  display: grid;
  box-shadow: 5px 5px 15px rgba(255, 255, 255, 0.2);
  /* grid-column: 2 / 6;
  grid-row: 4 / 5; */
  grid-template-columns: 1fr 1fr 1fr;

  @media (min-width: 1200px) {
    grid-column: 4 / 10;
    grid-row: 5 / 6;
    /* justify-self: center; */
    /* margin: 0 10%; */
  }
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

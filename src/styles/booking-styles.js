import styled from 'styled-components';
// import { Wrapper, Title,  Card} from '../components/Helpers';
import { Wrapper, SubTitle, Card } from '../components/Helpers';

const BookingWrapper = styled(Wrapper)`
  background-color: var(--dark-background);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='88' height='24' viewBox='0 0 88 24'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='autumn' fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M10 0l30 15 2 1V2.18A10 10 0 0 0 41.76 0H39.7a8 8 0 0 1 .3 2.18v10.58L14.47 0H10zm31.76 24a10 10 0 0 0-5.29-6.76L4 1 2 0v13.82a10 10 0 0 0 5.53 8.94L10 24h4.47l-6.05-3.02A8 8 0 0 1 4 13.82V3.24l31.58 15.78A8 8 0 0 1 39.7 24h2.06zM78 24l2.47-1.24A10 10 0 0 0 86 13.82V0l-2 1-32.47 16.24A10 10 0 0 0 46.24 24h2.06a8 8 0 0 1 4.12-4.98L84 3.24v10.58a8 8 0 0 1-4.42 7.16L73.53 24H78zm0-24L48 15l-2 1V2.18A10 10 0 0 1 46.24 0h2.06a8 8 0 0 0-.3 2.18v10.58L73.53 0H78z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(hsla(22, 94%, 58%, .9), hsla(0, 0%, 16%, 1));
  grid-template-columns: 50px 1fr 50px;
  justify-items: center;
  grid-gap: 1em;
  /* padding: 3% 2% 6% 2%; */
  grid-template-rows: 10vh auto 10vh;

   @media (min-width: 1200px) {
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
    grid-template-rows: 15vh auto 15vh;
    /* grid-template-columns: 1fr 400px 1fr; */
  }
`;

const BookingTitleWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  grid-gap: 10px;
  grid-column: 2 / 3;
  padding: 20px;
`;

const BookingSummaryTitleWrapper = styled(BookingTitleWrapper)`
  grid-template-rows: 1fr;
  padding: 10px 0px 40px 0px;
`;

const BookingTitle = styled(SubTitle)`
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  justify-self: center;
  align-self: end;
  height: fit-content;
  transform: rotate(0deg);
  margin: 0;

  @media(min-width: 1200px) {
    grid-column: 1 / 2;
    grid-row: 2 / 3;
    justify-self: end;
    align-self: start;
    margin-right: -47px;
    margin-top: 45px;
    transform: rotate(-90deg);
  }
`;

const BookingCard = styled(Card)`
  padding: 15px 5px;
  background-color: white;
  grid-column: 1 / -1;
  width: 85%;
  grid-row: 2 / 3;
  justify-self: center;

   @media (min-width: 1200px) {
     display: grid;
    padding: 35px;
    width: 700px;
    grid-column: 2 / 6;
    grid-row: 2 / 3;
    justify-content: center;
    /* width: 80%; */
  }
`;

const BookingForm = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr auto;
  grid-gap: 15px;
  width: unset;
  height: 400px;

   @media (min-width: 1200px) {
    width: 600px;
    text-align: center;
    height: 300px;
    grid-gap: 30px;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  grid-column: 1 / -1;
  width: 80%;
  height: 55px;
  font-size: 20px;
  justify-content: space-evenly;
  justify-self: center;
  align-items: center;
  align-self: flex-start;
  color: white;
  background: linear-gradient(to left, hsla(348, 86%, 59%, .9), hsla(39, 100%, 63%, 0.9));
  border: none;
  border-radius: 7px;
  border-bottom: 3px solid hsla(348, 2%, 10%, .5);
  box-shadow: 0px 2px 3px -1px rgba(0, 0, 0, 0.3);
  transition: .3s ease;
  letter-spacing: 1.8px;

    &:hover {
      background: linear-gradient(to left, hsla(348, 96%, 69%, .9), hsla(39, 100%, 63%, 0.9));
      box-shadow: 0 4px 4px rgba(0,0,0,.25);
    }
    &:active {
      background: linear-gradient(to left, hsla(348, 86%, 49%, .9), hsla(39, 90%, 43%, 0.9));
      -webkit-transform: translate(0px, 2px);
      transform: translate(0px, 2px);
      border-bottom: none;
      box-shadow: none;
    }

  @media(max-width: 900px) {
    margin: 0;
    font-size: 16px;
    &:hover {
      background: linear-gradient(to left, hsla(348, 86%, 59%, .9), hsla(39, 100%, 63%, 0.9));
      box-shadow: 0px 2px 3px -1px rgba(0, 0, 0, 0.3);
    }
  }
`;

const LeftHalfInputs = styled.div`
  display: grid;
  grid-column: 1 / 2;
  grid-template-rows: 1fr 1fr 1fr;
  grid-gap: 10px;

  @media (max-width: 900px) {
    grid-row: 1 / 2;
    grid-column: 1 / -1;
  }
`;

const RightHalfInputs = styled.div`
  grid-column: 2 / 3;

  @media (max-width: 900px) {
    grid-row: 2 / 3;
    grid-column: 1 / -1;
  }
`;

const LeftInput = styled.input`
  border: none;
  box-shadow: 0px 2px 4px rgba(50, 50, 93, 0.1), 0 3px 8px rgba(0, 0, 0, 0.07)!important;
  font-size: 16px;
  border-radius: 8px;
  padding: 10px;
  -webkit-appearance: none;

  &:focus {
    box-shadow: 0px 0px 2px hsla(276, 70%, 59%, .8);
  }

  @media (max-width: 900px) {
    width: 80%;
    justify-self: center;
  }
`;

const RightTextArea = styled.textarea`
  display: grid;
  border: none;
  box-shadow: 0px 2px 4px rgba(50, 50, 93, 0.1), 0 3px 8px rgba(0, 0, 0, 0.07);
  border-radius: 8px;
  font-size: 16px;
  padding: 10px;
  width: 100%;
  height: 100%;
  -webkit-appearance: none;

  &:focus {
    box-shadow: 0px 0px 2px hsla(276, 70%, 59%, .8);
  }

  @media (max-width: 900px) {
    width: 80%;
    margin: 0 auto;
    height: 150px;
  }
`;

export { BookingWrapper, BookingForm, SubmitButton, BookingCard, BookingTitle, BookingTitleWrapper, LeftHalfInputs, RightHalfInputs, RightTextArea, LeftInput, BookingSummaryTitleWrapper };

import styled from 'styled-components';
//import Link from 'gatsby-link';
import Link from 'next/link';
import {
  Wrapper,
  SubTitle,
  ImageWrapper,
  Copy,
  Card
} from '../components/Helpers';

const PastExperienceWrapper = styled(Wrapper)`
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-template-rows: 10vh auto auto 10vh;
  background-color: var(--dark-purple-background);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='105' viewBox='0 0 80 105'%3E%3Cg fill-rule='evenodd'%3E%3Cg id='death-star' fill='%239C92AC' fill-opacity='0.1'%3E%3Cpath d='M20 10a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm15 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zM20 75a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zm30-65a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V10zm0 65a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V75zM35 10a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zM5 45a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10zm60 35a5 5 0 0 1 10 0v50a5 5 0 0 1-10 0V45zm0-35a5 5 0 0 1 10 0v20a5 5 0 0 1-10 0V10z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E"),
  linear-gradient(hsla(240, 53%, 15%, 1), hsla(22, 94%, 58%, 0.9));

  @media (min-width: 1200px) {
    grid-template-rows: 100vh;
    overflow-y: hidden;
  }
  `;

const PastExperienceTitle = styled(SubTitle)`
  grid-column: 1 / -1;
  grid-row: 2 / 3;
  align-self: center;
  justify-self: center;
  height: fit-content;
  transform: rotate(0deg);
  color: white;

  @media (min-width: 1200px) {
    width: 260px;
    align-self: start;
    margin-top: 60%;
    margin-right: 0px;
    margin-left: 80px;
    transform: rotate(-90deg);
    grid-column: 1 / 2;
    grid-row: 1 / 2;
  }
`;

const PastExperienceCopy = styled(Copy)`
  grid-column: 1 / -1;
  grid-row: 3 / 4;
  width: 85%;
  justify-self: center;
  color: white;

  @media (min-width: 1200px) {
    align-self: center;
    grid-row: 1 / 2;
    padding-top: 2em;
    line-height: 29px;
    max-width: 700px;
  }
`;

const HomeButton = styled(Link)`
  display: flex;
  /* grid-column: 1 / -1; */
  /* width: 80%; */
  height: 55px;
  font-size: 20px;
  justify-content: space-evenly;
  /* justify-self: center; */
  align-items: center;
  /* align-self: flex-start; */
  color: white;
  margin: 1em auto;
  width: 10em;
  background: linear-gradient(
    to left,
    hsla(348, 86%, 59%, 0.9),
    hsla(39, 100%, 63%, 0.9)
  );
  border: none;
  border-radius: 7px;
  border-bottom: 3px solid hsla(348, 2%, 10%, 0.5);
  box-shadow: 0px 2px 3px -1px rgba(0, 0, 0, 0.3);
  transition: 0.3s ease;
  letter-spacing: 1.8px;

  &:hover {
    background: linear-gradient(
      to left,
      hsla(348, 86%, 59%, 0.9),
      hsla(39, 100%, 63%, 0.9)
    );
    box-shadow: 0px 2px 3px -1px rgba(0, 0, 0, 0.3);
  }

  &:active {
    background: linear-gradient(
      to left,
      hsla(348, 86%, 49%, 0.9),
      hsla(39, 90%, 43%, 0.9)
    );
    -webkit-transform: translate(0px, 2px);
    transform: translate(0px, 2px);
    border-bottom: none;
    box-shadow: none;
  }

  @media (min-width: 1200px) {
    margin: 1.5em auto;
    width: 10em;

    &:hover {
      background: linear-gradient(
        to left,
        hsla(348, 96%, 69%, 0.9),
        hsla(39, 100%, 63%, 0.9)
      );
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
    }
  }
`;

export {
  PastExperienceCopy,
  PastExperienceTitle,
  PastExperienceWrapper,
  HomeButton
};

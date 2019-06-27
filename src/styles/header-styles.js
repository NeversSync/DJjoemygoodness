/* eslint-disable no-use-before-define */
import styled from 'styled-components';
import Link from 'gatsby-link';
import { Title } from '../components/Helpers';

const HeaderContainer = styled.div`
  display: grid;
  background-color: var(--dark-background);
  z-index: 9999;
  /* grid-template-columns: 3.5fr 2fr 2fr; */
  grid-template-columns: 2.5fr 2fr 2fr;
  grid-template-rows: 100px;
  align-content: center;
  border-bottom: 1.5px solid hsla(360, 100%, 100%, .3);
  position: sticky;
  top: 0px;

  @media(min-width: 900px) {
    grid-template-columns: 1.75fr 4fr .5fr;
    grid-template-rows: 125px;
  }
`;

const LogoContainer = styled(Link)`
  display: grid;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  grid-gap: 10px;
  grid-template-columns: 2fr .5fr;
  padding: 10px;


  @media(max-width: 900px) and (orientation: landscape) {
    grid-template-columns: 1fr 1.5fr;
  }

  @media(min-width: 900px) {
    grid-gap: 15px;
    grid-template-columns: .5fr 1fr;

    &:hover ${LogoText} {
    color: var(--hover-color);
    }
  }
  `;

const Logo = styled.img`
  width: 100%;
  display: grid;
  grid-column: 1 / 2;
  align-self: center;
  max-width: 85px;
  max-height: 85px;
  min-width: 70px;
  min-height: 70px;
  border-radius: 50%;

  @media(min-width: 900px) {
    max-width: 100px;
    max-height: 100px;
  }
`;

const LogoText = styled(Title)`
  display: grid;
  align-self: center;
  justify-self: start;
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  text-align: center;
  transition: all 150ms ease-in-out;
`;

const NavContainer = styled.div`
    display: grid;
    grid-column: 1 / -1;
    grid-row: 1 / 2;
    height: 0vh;
    background: white;
    transition: background .5s ease-in-out, height .5s ease-in-out;
    z-index: -1;
`;

export { HeaderContainer, LogoContainer, Logo, LogoText, NavContainer };

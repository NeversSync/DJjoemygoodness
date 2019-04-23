/* eslint-disable no-use-before-define */
import styled from 'styled-components';
import { HashLink as Link } from 'react-router-hash-link';
import { Title } from '../components/Helpers';

const FooterContainer = styled.div`
  display: grid;
  background-color: var(--dark-background);
  align-content: center;
  border-bottom: 1.5px solid hsla(360, 100%, 100%, .3);
  padding: 2em;

  @media(min-width: 900px) {
    grid-template-columns: 2fr 2fr 2fr;
    grid-template-rows: auto auto ;
  }
`;

const LogoContainer = styled(Link)`
  display: grid; 
  grid-column: 3 / 4;
  grid-row: 1 / 2;
  justify-self: right;
  padding: 15px;
  width: fit-content;
  transition: all 200ms ease-in-out;
  
  &:hover {
    transform: scale(1.1);
  }
  `;

const Logo = styled.img`
  width: 100%;
  display: grid;
  grid-column: 1 / 2;
  align-self: center;
  max-width: 100px;
  max-height: 100px;
`;

const SocialText = styled(Title)`
  display: grid;
  align-self: center;
  justify-self: left;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  text-align: center;
  transition: all 150ms ease-in-out;
`;

const FooterNav = styled.div`
  display: grid;
  grid-template-columns: 100px 100px 100px 172px 111px;
  grid-row: 2 / 3;
  grid-column: 1 / -1;
  justify-self: center;
  justify-content: center;
`;

const FooterNavLinkWrapper = styled.div`
  display: grid;
  align-content: center;
  justify-content: center;
  border-left: 1px solid white;
`;

const FooterNavLink = styled(Link)`
  font-size: .7em;
  height: fit-content;
  width: fit-content;
  padding: 10px;
`;


export { FooterContainer, LogoContainer, Logo, SocialText, FooterNav, FooterNavLink, FooterNavLinkWrapper };
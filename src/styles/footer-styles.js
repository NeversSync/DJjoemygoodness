/* eslint-disable no-use-before-define */
import styled from 'styled-components';
import { HashLink as Link } from 'react-router-hash-link';
import { Title } from '../components/Helpers';

const FooterContainer = styled.div`
  display: grid;
  background-color: var(--dark-background);
  align-content: center;
  padding: 1em 0em;
  grid-template-rows: 75px 75px;
  
  @media(min-width: 1200px) {
    padding: 2em;
    grid-template-columns: 1fr 2fr .5fr;
    grid-template-rows: auto;
  }
`;

// const LogoContainer = styled(Link)`
//   display: grid; 
//   grid-column: 3 / 4;
//   grid-row: 1 / 2;
//   justify-self: right;
//   padding: 15px;
//   width: fit-content;
//   transition: all 200ms ease-in-out;
  
//   &:hover {
//     transform: scale(1.1);
//   }
//   `;

// const Logo = styled.img`
//   width: 100%;
//   display: grid;
//   grid-column: 1 / 2;
//   align-self: center;
//   max-width: 100px;
//   max-height: 100px;
// `;
const Social = styled.div`
    display: grid;
    justify-content: left;
    align-content: center;
    grid-template-columns: auto auto;
    grid-row: 1 / 2;
    grid-column: 1 / -1;
    justify-self: center;
    
    @media(min-width: 1200px) {
      grid-column: 1 / 2;
    }    
`;

const SocialText = styled(Title)`
  display: grid;
  align-self: center;
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  text-align: center;
  transition: all 150ms ease-in-out;
  margin-right: 5px;
  
  @media(min-width: 1200px) {
    margin-right: 25px;
    min-width: 240px;
  } 
`;

const SocialIconWrapper = styled.div`
  display: grid;
  grid-column: 2 / 3;
  grid-template-columns: auto auto auto;
`;

const SocialIcon = styled.a`
  display: grid;
  justify-content: center;
  align-items: center;
  padding: 0px 10px;
`;

const FooterNav = styled.div`
  display: grid;
  grid-template-columns: auto auto auto auto auto;
  grid-row: 2 / 3;
  grid-column: 1 / -1;
  justify-self: center;
  
  @media(min-width: 1200px) {
    grid-template-columns: 100px 100px 100px 172px 111px;
    grid-row: 1 / 2;
    grid-column: 3 / 4;
  } 
`;

const FooterNavLinkWrapper = styled.div`
  display: grid;
  align-content: center;
  justify-content: center;
  border-left: 1px solid white;
  height: fit-content;
  align-self: center;
`;

const FooterNavLink = styled(Link)`
  font-size: .7em;
  height: fit-content;
  width: fit-content;
  padding: 10px;
  text-align: center;
  &:hover {
    color: var(--link-color);
  }
`;



export { FooterContainer, SocialText, FooterNav, FooterNavLink, FooterNavLinkWrapper, Social, SocialIcon, SocialIconWrapper };
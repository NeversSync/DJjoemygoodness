import styled from 'styled-components';
import { ImageWrapper, Title } from '../components/Helpers';

const HeaderContainer = styled.div`
  display: grid;
  grid-template-columns: 3.5fr 2fr 2fr;
  grid-template-rows: 150px;
  align-content: center;
  border-bottom: 1px solid white;

  @media(min-width: 900px) {
    grid-template-columns: 1.75fr 4fr .5fr;
  }
`;

const LogoContainer = styled(ImageWrapper)`
  display: grid; 
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  grid-gap: 10px;
  grid-template-columns: 2fr .5fr;
  padding: 10px;
  
  @media(min-width: 900px) {
    grid-gap: 15px;
    grid-template-columns: .5fr 1fr;
  }
  `;

const Logo = styled.img`
  width: 100%;
  display: grid;
  grid-column: 1 / 2;
  align-self: center;
  max-width: 115px;
  max-height: 115px;
`;

const LogoText = styled(Title)`
  display: grid;
  align-self: center;
  justify-self: start;
  grid-column: 2 / 3;
  grid-row: 1 / 2;
  text-align: center;
`;

const NavContainer = styled.div`
    display: grid;
    grid-column: 3 / 4;
    grid-row: 1 / 2;
    justify-self: center;
`;

const MenuIcon = styled.div`
  align-self: center;
  width: 30px;
  height: 30px;
  cursor: pointer;
  transform: rotate(0deg);
  transition: 0.5s ease-in-out;
`;

export { HeaderContainer, LogoContainer, Logo, LogoText, NavContainer, MenuIcon };

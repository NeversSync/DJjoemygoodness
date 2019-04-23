/* eslint-disable no-use-before-define */
import React from 'react';

import Nav from './Nav';
import {
  HeaderContainer,
  LogoContainer,
  Logo,
  LogoText
} from '../styles/header-styles';

const Header = props => (
  <HeaderContainer>
    <LogoContainer to='#top' smooth>
      <Logo
        src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto,r_500/v1553276016/joe-good/CartoonJoe.jpg'
        alt='logo'
      />
      <LogoText>
        Joe My
        <br /> Goodness
      </LogoText>
    </LogoContainer>
    <Nav
      hoverLink={props.hoverLink}
      activeLink={props.activeLink}
      handleKnobLinkHover={props.handleKnobLinkHover}
      handleKnobClick={props.handleKnobClick}
    />
  </HeaderContainer>
);

export default Header;

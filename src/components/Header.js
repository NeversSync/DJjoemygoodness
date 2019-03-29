/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import styled from 'styled-components';
// import { slide as Menu } from 'react-burger-menu';



import Nav from './Nav';
import { HeaderContainer, LogoContainer, Logo, LogoText, NavContainer, MenuIcon, MenuIconWrapper } from '../styles/header-styles';

class Header extends Component {

  render() {
    return (
      <div>
        <HeaderContainer>
          <LogoContainer>
            <Logo src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto,r_500/v1553276016/joe-good/CartoonJoe.jpg' alt="logo" />
            <LogoText>Joe My<br /> Goodness</LogoText>
          </LogoContainer>
          <Nav />
        </HeaderContainer>
      </div>
    );
  }
}

export default Header;

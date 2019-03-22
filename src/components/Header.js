/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import styled from 'styled-components';

// import Nav from './Nav';
import {HeaderContainer, LogoContainer, Logo, LogoText, NavContainer, MenuIcon} from '../styles/header-styles';

const MenuSpan = styled.span`
  display: block;
  position: absolute;
  top: 0px;
  height: 4px;
  width: 100%;
  justify-self: right;
  background: white;
  border-radius: 9px;
  opacity: 1;
  left: 0;
  -webkit-transform: rotate(0deg);
  -moz-transform: rotate(0deg);
  -o-transform: rotate(0deg);
  transform: rotate(0deg);
  -webkit-transition: 0.25s ease-in-out;
  -moz-transition: 0.25s ease-in-out;
  -o-transition: 0.25s ease-in-out;
  transition: 0.25s ease-in-out;

  ${MenuSpan}:nth-child(1) {
    top: ${props => props.open === 'open' ? 
    '18px' : '0px'};
  }

  ${MenuSpan}:nth-child(2), ${MenuSpan}:nth-child(3) {
    top: 9px;
  }

  ${MenuSpan}:nth-child(2) {
    -webkit-transform: ${props => props.open === 'open' ? 
    'rotate(45deg)' : 'rotate(0deg'};
    -moz-transform: ${props => props.open === 'open' ? 
    'rotate(45deg)' : 'rotate(0deg'};
    -o-transform: ${props => props.open === 'open' ? 
    'rotate(45deg)' : 'rotate(0deg'};
    transform: ${props => props.open === 'open' ? 
    'rotate(45deg)' : 'rotate(0deg'};
  }

  ${MenuSpan}:nth-child(3) {
    -webkit-transform: ${props => props.open === 'open' ? 
    'rotate(-45deg)' : 'rotate(0deg'};
    -moz-transform: ${props => props.open === 'open' ? 
    'rotate(-45deg)' : 'rotate(0deg'};
    -o-transform: ${props => props.open === 'open' ? 
    'rotate(-45deg)' : 'rotate(0deg'};
    transform: ${props => props.open === 'open' ? 
    'rotate(-45deg)' : 'rotate(0deg'};
  }

  ${MenuSpan}:nth-child(4) {
    top: ${props => props.open === 'open' ? 
    '18px' : '0px'};
    width: ${props => props.open === 'open' ? 
    '0%' : '100%'};
    left: ${props => props.open === 'open' ?
    '50%' : '0%'};
  }
`;

// TODO: 
// Troubleshoot last menu span not having styles applied when menu is closed

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showHideSidenav: 'open'
    };

    this.toggleSidenav = this.toggleSidenav.bind(this);
  }

  toggleSidenav() {
    this.state.showHideSidenav === 'open'
      ? this.setState({ showHideSidenav: 'closed' })
      : this.setState({ showHideSidenav: 'open' });
  }

  render() {
    const toggleSidenav = this.toggleSidenav;
    return (
      <HeaderContainer>
        <LogoContainer>
          <Logo src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto,r_500/v1553276016/joe-good/CartoonJoe.jpg' alt="logo" />
          <LogoText>Joe My<br/> Goodness</LogoText>
        </LogoContainer>
        <NavContainer>
          <MenuIcon onClick={toggleSidenav}>
            <MenuSpan open={this.state.showHideSidenav} />
            <MenuSpan open={this.state.showHideSidenav} />
            <MenuSpan open={this.state.showHideSidenav} />
            <MenuSpan open={this.state.showHideSidenav} />
          </MenuIcon>
        </NavContainer>
      </HeaderContainer>
    );
  }
}

export default Header;

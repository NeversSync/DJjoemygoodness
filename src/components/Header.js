/* eslint-disable no-use-before-define */
import React, { Component } from 'react';
import styled from 'styled-components';
// import { slide as Menu } from 'react-burger-menu';



import Nav from './Nav';
import { HeaderContainer, LogoContainer, Logo, LogoText, NavContainer, MenuIcon, MenuIconWrapper } from '../styles/header-styles';

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showHideSidenav: 'closed',
      navBackgroundVisible: 'rgba(215, 212, 217, 0)',
      navHeight: '30vh'
    };

    this.toggleSidenav = this.toggleSidenav.bind(this);
  }

  toggleSidenav() {
    this.state.showHideSidenav === 'open'
      ? this.setState({ showHideSidenav: 'closed' })
      : this.setState({ showHideSidenav: 'open' });
    this.state.navBackgroundVisible === 'rgba(215, 212, 217, 0)'
      ? this.setState({ navBackgroundVisible: 'rgba(215, 212, 217, 1)' })
      : this.setState({ navBackgroundVisible: 'rgba(215, 212, 217, 0)' });
    this.state.navItemVisibility === 'hidden'
      ? this.setState({ navItemVisibility: 'visible' })
      : this.setState({ navItemVisibility: 'hidden' });
    this.state.navItemOpacity === '0'
      ? this.setState({ navItemOpacity: '1' })
      : this.setState({ navItemOpacity: '0' });
    this.state.navHeight === '30vh'
      ? this.setState({ navHeight: '100vh' })
      : this.setState({ navHeight: '30vh' });
  }

  // SubMenuToggle() {
  //   this.state.height === '0px'
  //     ? this.setState({ height: '150px', dropOpacity: '1' })
  //     : this.setState({ height: '0px', dropOpacity: '0' });
  //   this.state.NavItemVisibility === 'hidden'
  //     ? this.setState({ NavItemVisibility: 'visible' })
  //     : this.setState({ NavItemVisibility: 'hidden' });
  // }

  render() {
    const toggleSidenav = this.toggleSidenav;
    const navBackgroundVisible = this.navBackgroundVisible;
    const navHeight = this.navHeight;
    return (
      <div>
        <HeaderContainer>
          <LogoContainer>
            <Logo src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto,r_500/v1553276016/joe-good/CartoonJoe.jpg' alt="logo" />
            <LogoText>Joe My<br /> Goodness</LogoText>
          </LogoContainer>
          <Nav />
          {/* <MenuIconWrapper>
          <MenuIcon
            id="nav-icon"
            onClick={toggleSidenav}
            className={this.state.showHideSidenav}
          >
            <span />
            <span />
            <span />
            <span />
          </MenuIcon>
        </MenuIconWrapper> */}
          {/* <NavContainer >
        </NavContainer> */}
        </HeaderContainer>
      </div>
    );
  }
}

export default Header;

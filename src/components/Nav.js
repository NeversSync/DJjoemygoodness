import React, { Component } from 'react';
import styled from 'styled-components';
import { slide as Menu } from 'react-burger-menu';

import KnobNav from './KnobNav';

const styles = {
  bmBurgerButton: {
    position: 'fixed',
    width: '36px',
    height: '30px',
    left: 'initial',
    right: '36px',
    top: '56px'
  },
  bmBurgerBars: {
    background: '#eee'
  },
  bmBurgerBarsHover: {
    color: '#a8d8f8',
    background: '#a8d8f8'
  },
  bmCrossButton: {
    height: '24px',
    width: '24px',
    right: '14px'
  },
  bmCross: {
    background: '#bdc3c7',
    width: '3px',
    height: '24px'
  },
  bmMenuWrap: {
    position: 'fixed',
    height: '100%'
  },
  bmMenu: {
    background: '#373a47',
    padding: '2.5em 1.5em 0',
    display: 'grid',
    justifyContent: 'center',
    alignContent: 'center'
  },
  bmMorphShape: {
    fill: '#373a47'
  },
  bmItemList: {
    color: '#b8b7ad',
    padding: '0.8em'
  },
  bmItem: {
    display: 'inline-block'
  },
  bmOverlay: {
    background: 'rgba(0, 0, 0, 0.3)'
  }
};

const MenuKnobNavWrapper = styled.div`
  display: grid;
  grid-column: 1 / -1;
  justify-content: center;
  /* grid-row: 2 / 3; */
  /* background-color: hsla(0, 0%, 16%, 1); */

  /* @media(min-width: 1200px) {
   grid-column: 2 / 3; 
   grid-row: 1 / 2;
  } */
`;

class Nav extends Component {

  render () {
    return (
      <Menu right width={ '100%' } styles={styles}>
        <MenuKnobNavWrapper>
          <KnobNav/>
        </MenuKnobNavWrapper>
        {/* <a id="home" className="menu-item" href="/">Home</a>
        <a id="about" className="menu-item" href="/about">About</a>
        <a id="contact" className="menu-item" href="/contact">Contact</a> */}
      </Menu>
    );
  }
}

export default Nav;
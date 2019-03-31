import React from 'react';
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
    top: '35px',
    transform: 'scaleY(.85)'
  },
  bmBurgerBars: {
    background: '#eee',
    borderRadius: '2px',
    height: '5px',
  },
  bmBurgerBarsHover: {
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
`;

const Nav = () => (
  <Menu right width={'100%'} styles={styles}>
    <MenuKnobNavWrapper>
      <KnobNav />
    </MenuKnobNavWrapper>
  </Menu>
);

export default Nav;
import React from 'react';
import styled from 'styled-components';

const NavContainer = styled.div`
  /* height: 40px; */
`;

const MenuIcon = styled.div`
  width: 30px;
  height: 30px;
  color: white;
  cursor: pointer;
  transform: rotate(0deg);
  transition: .5s ease-in-out;
`;

const Nav = () => (
  <NavContainer>
    <MenuIcon
      id="nav-icon"
    // onClick={toggleSidenav}
    // className={showHideSidenav}
    >
      <span />
      <span />
      <span />
      <span />
    </MenuIcon>
  </NavContainer>
);

export default Nav;
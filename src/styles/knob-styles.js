import { HashLink as Link } from 'react-router-hash-link';
import styled from 'styled-components';

const KnobNavLink = styled(Link)`
  position: absolute;
  
  h3 {
    transition: all 200ms ease-in-out;
    font-size: .7em;
    &:hover, &:active {
      color: var(--hover-color);
      transform: scale(1.1);
    }
    @media(min-width: 1200px) {
    font-size: .8em
    }            
  }
`;

const KnobNavLink1 = styled(KnobNavLink)`
  color: var(--link-color);
  transform: rotate(-90deg);
  top: -105px;
  right: 50px;

  @media(min-width: 1200px) {
    top: -122px;
    right: 96px;
  }            
  `;

const KnobNavLink2 = styled(KnobNavLink)`
  top: -104px;
  right: -4px;
  transform: rotate(-69deg);
  
  @media(min-width: 1200px) {
    top: -114px;
    right: 16px;
    transform: rotate(-63deg);
  }            
  `;

const KnobNavLink3 = styled(KnobNavLink)`
  top: -79px;
  right: -45px;
  transform: rotate(-47deg);
  `;

const KnobNavLink4 = styled(KnobNavLink)`
  top: -65px;
  right: -149px;
  transform: rotate(-36deg);
  
  @media(min-width: 1200px) {
    top: -51px;
    right: -175px;
    transform: rotate(-31deg);
  }            
  `;

const KnobNavLink5= styled(KnobNavLink)`
    top: 0px;
    right: -120px;
    transform: rotate(-17deg);
  
  @media(min-width: 1200px) {
    top: 33px;
    right: -141px;
    transform: rotate(-16deg);
  }            
`;

export { KnobNavLink, KnobNavLink1, KnobNavLink2, KnobNavLink3, KnobNavLink4, KnobNavLink5 };
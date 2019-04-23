/* eslint-disable no-use-before-define */
import React from 'react';

import {
  FooterContainer,
  LogoContainer,
  Logo,
  SocialText,
  FooterNav,
  FooterNavLink,
  FooterNavLinkWrapper
} from '../styles/footer-styles';

// TODO: Add social icons

const Footer = props => (
  <FooterContainer>
    <LogoContainer to='#top' smooth>
      <Logo
        src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto,r_500/v1553276016/joe-good/CartoonJoe.jpg'
        alt='logo'
      />
    </LogoContainer>
    <SocialText>
      Keep in Touch
    </SocialText>
    <FooterNav
      hoverLink={props.hoverLink}
      activeLink={props.activeLink}
      handleKnobLinkHover={props.handleKnobLinkHover}
      handleKnobClick={props.handleKnobClick}
    >
      <FooterNavLinkWrapper style={{borderLeft: 'none'}}>
        <FooterNavLink
          smooth
          to='/#home'
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'HOME' ? 'active-link' : ''}
        >HOME
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          smooth
          to='/#about'
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'ABOUT' ? 'active-link' : ''}
        >ABOUT
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          smooth
          to='/#music'
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'MUSIC' ? 'active-link' : ''}
        >MUSIC
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          smooth
          to='/#side-projects'
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'SIDE PROJECTS' ? 'active-link' : ''}
        >SIDE PROJECTS
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          smooth
          to='/#booking'
          onClick={props.handleKnobClick}
          className={props.activeLink === 'BOOKING' ? 'active-link' : ''}
          onMouseOver={props.handleKnobLinkHover}
        >
          BOOKING
        </FooterNavLink>
      </FooterNavLinkWrapper>
    </FooterNav>
  </FooterContainer>
);

export default Footer;

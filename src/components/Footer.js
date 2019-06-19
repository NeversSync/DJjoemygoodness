/* eslint-disable no-use-before-define */
import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import { FaSoundcloud } from 'react-icons/fa';
import { FaRegEnvelope } from 'react-icons/fa';

import {
  FooterContainer,
  LogoContainer,
  Logo,
  SocialText,
  FooterNav,
  FooterNavLink,
  FooterNavLinkWrapper,
  Social,
  SocialIcon,
  SocialIconWrapper
} from '../styles/footer-styles';

const Footer = props => (
  <FooterContainer>
    {/* <LogoContainer to='>
      <Logo
        src='https://res.cloudinary.com/nicky-cloudinary/image/upload/f_auto,q_auto,r_500/v1553276016/joe-good/CartoonJoe.jpg'
        alt='logo'
      />
    </LogoContainer> */}
    <Social>
      <SocialText>Keep in Touch</SocialText>
      <SocialIconWrapper>
        <SocialIcon href='https://www.instagram.com/djjoemygoodness/' target="_blank" rel="noopener noreferrer" className="social-icon">
          <FaInstagram />
        </SocialIcon>
        <SocialIcon href='https://soundcloud.com/joe-good-1' target="_blank" rel="noopener noreferrer" className="social-icon">
          <FaSoundcloud  />
        </SocialIcon>
        <SocialIcon href='mailto:djjoemygoodness@gmail.com' target="_blank" rel="noopener noreferrer" className="social-icon">
          <FaRegEnvelope  />
        </SocialIcon>
      </SocialIconWrapper>
    </Social>
    <FooterNav
      hoverLink={props.hoverLink}
      activeLink={props.activeLink}
      handleKnobLinkHover={props.handleKnobLinkHover}
      handleKnobClick={props.handleKnobClick}
    >
      <FooterNavLinkWrapper style={{ borderLeft: 'none' }}>
        <FooterNavLink
          to='/#home'
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'HOME' ? 'active-link' : ''}
        >
          HOME
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          to='/#about'
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'ABOUT' ? 'active-link' : ''}
        >
          ABOUT
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          to='/#music'
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'MUSIC' ? 'active-link' : ''}
        >
          MUSIC
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          to='/#side-projects'
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'SIDE PROJECTS' ? 'active-link' : ''}
        >
          SIDE PROJECTS
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
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

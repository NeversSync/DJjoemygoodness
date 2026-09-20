/* eslint-disable no-use-before-define */
import React from 'react';
import { FaInstagram, FaSoundcloud, FaRegEnvelope, FaYoutube } from 'react-icons/fa';

import {
  FooterContainer,
  SocialText,
  FooterNav,
  FooterNavLink,
  FooterNavLinkWrapper,
  Social,
  SocialIcon,
  SocialIconWrapper,
} from '../styles/footer-styles';

const Footer = (props) => (
  <FooterContainer>
    <Social>
      <SocialText>Keep in Touch</SocialText>
      <SocialIconWrapper>
        <SocialIcon
          href="https://www.instagram.com/djjoemygoodness/"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          title="@djjoemygoodness"
        >
          <FaInstagram />
        </SocialIcon>
        <SocialIcon
          href="https://www.youtube.com/playlist?list=PLSAGhFyWcKwk"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          title="Equilateral Expedition on YouTube"
        >
          <FaYoutube />
        </SocialIcon>
        <SocialIcon
          href="https://soundcloud.com/joe-good-1"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          title="JoeMyGoodness on SoundCloud"
        >
          <FaSoundcloud />
        </SocialIcon>
        <SocialIcon
          href="mailto:djjoemygoodness@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
          className="social-icon"
          title="Email"
        >
          <FaRegEnvelope />
        </SocialIcon>
      </SocialIconWrapper>
    </Social>
    <FooterNav>
      <FooterNavLinkWrapper style={{ borderLeft: 'none' }}>
        <FooterNavLink
          href="/#home"
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'HOME' ? 'active-link' : ''}
        >
          HOME
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          href="/#about"
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'ABOUT' ? 'active-link' : ''}
        >
          ABOUT
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          href="/#music"
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'MUSIC' ? 'active-link' : ''}
        >
          MUSIC
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          href="/#side-projects"
          onClick={props.handleKnobClick}
          onMouseOver={props.handleKnobLinkHover}
          className={props.activeLink === 'SIDE PROJECTS' ? 'active-link' : ''}
        >
          SIDE PROJECTS
        </FooterNavLink>
      </FooterNavLinkWrapper>
      <FooterNavLinkWrapper>
        <FooterNavLink
          href="/#booking"
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

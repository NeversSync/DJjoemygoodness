import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import {
  InstaFeedContainer,
  InstaTitleWrapper,
} from '../styles/instagram-style';
import { SubTitle } from './Helpers';
import { SocialIcon } from '../styles/footer-styles';

const InstagramFeed = () => (
  <InstaFeedContainer>
    <InstaTitleWrapper>
      <SocialIcon
        href="https://www.instagram.com/djjoemygoodness/"
        target="_blank"
        rel="noopener noreferrer"
        className="social-icon"
        style={{ width: 'fit-content' }}
      >
        <FaInstagram />
      </SocialIcon>
      <SubTitle style={{ textAlign: 'center' }}>
        Joe My Goodness on Instagram
      </SubTitle>
      <a
        href="https://www.instagram.com/djjoemygoodness/"
        target="_blank"
        rel="noopener noreferrer"
        className="custom-link"
        style={{ textAlign: 'center', marginTop: '0.5em' }}
      >
        Follow @djjoemygoodness
      </a>
    </InstaTitleWrapper>
  </InstaFeedContainer>
);

export default InstagramFeed;

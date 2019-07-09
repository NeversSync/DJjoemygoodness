import React from 'react';
import { FaInstagram } from 'react-icons/fa';
import {
  InstaFeedImagesWrapper,
  InstaImageWrapper,
  InstaFeedContainer,
  InstaTitleWrapper
} from '../styles/instagram-style';
import { graphql, StaticQuery } from 'gatsby';
import Image from 'gatsby-image';
import { Title, SubTitle } from './Helpers';
import { SocialIcon, SocialIconWrapper } from '../styles/footer-styles';

const InstagramFeed = () => (
  <StaticQuery
    query={graphql`
      query myQuery {
        allInstagramContent {
          edges {
            node {
              localImage {
                childImageSharp {
                  fluid(maxHeight: 500, maxWidth: 500, quality: 90) {
                    ...GatsbyImageSharpFluid_withWebp
                  }
                }
              }
              images {
                standard_resolution {
                  url
                }
              }
            }
          }
        }
      }
    `}
    render={data => (
      <InstaFeedContainer>
        <InstaTitleWrapper>
          <SocialIcon
            href='https://www.instagram.com/djjoemygoodness/'
            target='_blank'
            rel='noopener noreferrer'
            className='social-icon'
            style={{ width: 'fit-content' }}
          >
            <FaInstagram />
          </SocialIcon>
          <SubTitle style={{textAlign: 'center'}}>Joe My Goodness on Instagram</SubTitle>
        </InstaTitleWrapper>
        <InstaFeedImagesWrapper>
          {data.allInstagramContent.edges.slice(0, 9).map((item, i) => {
            return item.node.localImage ? (
              <InstaImageWrapper key={i}>
                <a
                  href='https://www.instagram.com/djjoemygoodness/'
                  key={i}
                  target='_blank'
                  className='ig-image'
                >
                  <Image
                    fluid={item.node.localImage.childImageSharp.fluid}
                    key={i}
                    style={{ borderRadius: '5px' }}
                  />
                </a>
              </InstaImageWrapper>
            ) : (
              <div />
            );
          })}
        </InstaFeedImagesWrapper>
      </InstaFeedContainer>
    )}
  />
);

export default InstagramFeed;

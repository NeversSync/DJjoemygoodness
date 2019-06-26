import React from 'react';
// import { Card, Title } from '../components/Helpers';
import { InstaFeedWrapper, InstaImageWrapper } from '../styles/instagram-style';
import { graphql, StaticQuery } from 'gatsby';
import Image from 'gatsby-image';

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
      <div>
        <InstaFeedWrapper>
          {data.allInstagramContent.edges.slice(0, 5).map((item, i) => {
            return item.node.localImage ? (
              <InstaImageWrapper key={i}>
                <Image
                  fluid={item.node.localImage.childImageSharp.fluid}
                  key={i}
                />
              </InstaImageWrapper>
            ) : (
              <div />
            );
          })}
        </InstaFeedWrapper>
      </div>
    )}
  />
);

export default InstagramFeed;

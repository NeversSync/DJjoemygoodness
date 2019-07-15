import React from 'react';
import { StaticQuery, graphql } from 'gatsby';
import Helmet from 'react-helmet';
import styled from 'styled-components';
import 'reset-css';
import '../styles/boss.css';
import '../styles/App.scss';

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  justify-content: center;
`;

const Layout = ({ children }) => (
  <StaticQuery
    query={graphql`
      query LayoutQuery {
        site {
          siteMetadata {
            title
          }
        }
      }
    `}
    render={data => (
      <>
        <Helmet
          title='DJ Joe My Goodness'
          meta={[
            { name: 'DJ Joe My Goodness', content: 'Joemygoodness' },
            { name: 'keywords', content: 'DJ Joe My Goodness' },
            { name: 'description', content: 'DJ Joe My Goodness, professional DJ and musician.' },
            { name: 'og:image', content: 'https://joemygoodness.com/joemygoodness-screenshot.png' },
            { name: 'og:url', content: 'https://joemygoodness.com/' },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:url', content: 'https://joemygoodness.com/' },
            { name: 'twitter:title', content: 'DJ Joe My Goodness' },
            { name: 'twitter:description', content: 'DJ Joe My Goodness, professional DJ and musician.' },
            { name: 'twitter:image', content: 'https://joemygoodness.com/joemygoodness-screenshot.png' }
          ]}
        />
        <Content>{children}</Content>
      </>
    )}
  />
);

export default Layout;

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
            // { name: 'DJ Joe My Goodness', content: 'Joemygoodness' },
            { name: 'keywords', content: 'DJ Joe My Goodness' }
          ]}
        />
        <title>DJ Joe My Goodness</title>
        <meta
          name='description'
          content='DJ Joe My Goodness, professional DJ and musician.'
        />
        <meta property='og:type' content='website' />>
        <meta property='og:url' content='https://joemygoodness.com/' />
        <meta property='og:title' content='DJ Joe My Goodness' />
        <meta
          property='og:description'
          content='DJ Joe My Goodness, professional DJ and musician.'
        />
        <meta property='og:image' content='https://joemygoodness.com/joemygoodness-screenshot.png' />
        <meta property='twitter:card' content='summary_large_image' />
        <meta property='twitter:url' content='https://joemygoodness.com/' />
        <meta property='twitter:title' content='DJ Joe My Goodness' />
        <meta
          property='twitter:description'
          content='DJ Joe My Goodness, professional DJ and musician.'
        />
        <meta property='twitter:image' content='https://joemygoodness.com/joemygoodness-screenshot.png' />
        <Content>{children}</Content>
      </>
    )}
  />
);

export default Layout;

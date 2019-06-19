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
          title="DJ Joe My Goodness"
          meta={[
            { name: 'DJ Joe My Goodness', content: 'Joemygoodness' },
            { name: 'keywords', content: 'DJ Joe My Goodness' }
          ]}
        />
        <Content>{children}</Content>
      </>
    )}
  />
);

export default Layout;

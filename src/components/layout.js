import React from 'react';
import Head from 'next/head';
import styled from 'styled-components';

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  justify-content: center;
`;

const Layout = ({ children }) => (
  <>
    <Head>
      <title>DJ Joe My Goodness</title>
      <meta name="DJ Joe My Goodness" content="Joemygoodness" />
      <meta name="keywords" content="DJ Joe My Goodness" />
      <meta
        name="description"
        content="DJ Joe My Goodness, professional DJ and musician."
      />
      <meta
        property="og:image"
        content="https://joemygoodness.com/joemygoodness-screenshot.png"
      />
      <meta property="og:url" content="https://joemygoodness.com/" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content="https://joemygoodness.com/" />
      <meta name="twitter:title" content="DJ Joe My Goodness" />
      <meta
        name="twitter:description"
        content="DJ Joe My Goodness, professional DJ and musician."
      />
      <meta
        name="twitter:image"
        content="https://joemygoodness.com/joemygoodness-screenshot.png"
      />
    </Head>
    <Content>{children}</Content>
  </>
);

export default Layout;

import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import styled from 'styled-components';
import Layout from '../components/layout';

const ParticipateApp = dynamic(
  () => import('../participate/mb/ParticipateApp'),
  {
    ssr: false,
    loading: () => (
      <ParticipateLoading aria-busy="true">Loading Motion Builder…</ParticipateLoading>
    ),
  }
);

const ParticipateShell = styled.div`
  position: relative;
  min-height: 100dvh;
  width: 100%;
  background: #0f1218;
  color: #e8eaed;
`;

const HomeChrome = styled(Link)`
  position: fixed;
  top: 10px;
  left: 12px;
  z-index: 40;
  padding: 6px 12px;
  font-size: 0.85rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #9ec9e8;
  background: rgba(15, 18, 24, 0.85);
  border: 1px solid rgba(158, 201, 232, 0.35);
  border-radius: 4px;
  text-decoration: none;

  &:hover,
  &:focus-visible {
    color: #fff;
    border-color: #9ec9e8;
  }
`;

const ParticipateLoading = styled.div`
  display: grid;
  place-items: center;
  min-height: 100dvh;
  color: #9aa0a6;
  font-size: 0.95rem;
`;

const ParticipatePage = () => (
  <Layout>
    <ParticipateShell>
      <HomeChrome href="/">Home</HomeChrome>
      <ParticipateApp />
    </ParticipateShell>
  </Layout>
);

export default ParticipatePage;

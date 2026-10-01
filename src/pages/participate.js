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
  /* Room for fixed HOME (bottom-left) + layout FAB (bottom-right) */
  padding-bottom: 64px;
`;

/**
 * Compact DjJoe CTA — same coral→amber gradient / letter-spacing as
 * past-experience HOME, parked bottom-left so it never covers Preview “?”
 * or the layout FAB.
 */
const HomeChrome = styled(Link)`
  position: fixed;
  bottom: 14px;
  left: 14px;
  z-index: 15;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45em;
  height: 42px;
  padding: 0 1.1em 0 0.85em;
  font-family: Rubik, sans-serif;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 1.8px;
  text-transform: uppercase;
  text-decoration: none;
  color: #fff;
  background: linear-gradient(
    to left,
    hsla(348, 86%, 59%, 0.92),
    hsla(39, 100%, 63%, 0.92)
  );
  border: none;
  border-radius: 7px;
  border-bottom: 3px solid hsla(348, 2%, 10%, 0.5);
  box-shadow: 0 2px 3px -1px rgba(0, 0, 0, 0.3);
  transition: 0.3s ease;

  &:hover,
  &:focus-visible {
    color: #fff;
    background: linear-gradient(
      to left,
      hsla(348, 96%, 69%, 0.95),
      hsla(39, 100%, 63%, 0.95)
    );
    box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  }

  &:active {
    transform: translateY(2px);
    border-bottom: none;
    box-shadow: none;
  }
`;

const HomeArrow = styled.span`
  display: inline-block;
  font-size: 1.05em;
  line-height: 1;
  transform: translateY(-1px);
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
      <HomeChrome href="/" aria-label="Back to DJ Joe My Goodness home">
        <HomeArrow aria-hidden>←</HomeArrow>
        Home
      </HomeChrome>
      <ParticipateApp />
    </ParticipateShell>
  </Layout>
);

export default ParticipatePage;

require('@testing-library/jest-dom');

jest.mock('smooth-scroll', () => () => ({}));

jest.mock('next/head', () => {
  const React = require('react');
  return function MockHead({ children }) {
    return React.createElement(React.Fragment, null, children);
  };
});

jest.mock('next/link', () => {
  const React = require('react');
  return function MockLink({ children, href, ...props }) {
    return React.createElement('a', { href, ...props }, children);
  };
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import IndexPage from '../pages/index';
import * as sectionNav from '../lib/sectionNav';

jest.mock('../lib/sectionNav', () => {
  const actual = jest.requireActual('../lib/sectionNav');
  return {
    ...actual,
    scrollToSection: jest.fn(() => true),
  };
});

// Keep the index page lighter: burger menu + iframes are out of scope here.
jest.mock('../components/Header', () => {
  return function MockHeader() {
    return <header>Header</header>;
  };
});

jest.mock('../components/Music', () => {
  return function MockMusic() {
    return <section id="music">Music</section>;
  };
});

jest.mock('../components/SideProjects', () => {
  return function MockSideProjects() {
    return <section id="side-projects">Side Projects</section>;
  };
});

jest.mock('../components/Booking', () => {
  return function MockBooking() {
    return <section id="booking">Booking</section>;
  };
});

jest.mock('../components/Footer', () => {
  return function MockFooter() {
    return <footer>Footer</footer>;
  };
});

describe('IndexPage dial navigation', () => {
  beforeEach(() => {
    sectionNav.scrollToSection.mockClear();
  });

  it('updates dial state and scrolls when ABOUT is clicked', async () => {
    const user = userEvent.setup();
    const { container } = render(<IndexPage />);

    await user.click(screen.getByRole('link', { name: 'ABOUT' }));

    expect(sectionNav.scrollToSection).toHaveBeenCalledWith('about');
    expect(container.querySelector('.about-rotate')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'ABOUT' })).toHaveClass(
      'active-link'
    );
  });
});

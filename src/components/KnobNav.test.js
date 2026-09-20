import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KnobNav from './KnobNav';

describe('KnobNav', () => {
  it('calls handleKnobClick when a section label is activated', async () => {
    const user = userEvent.setup();
    let clickedHref = null;
    const handleKnobClick = jest.fn((event) => {
      clickedHref = event.currentTarget.getAttribute('href');
      event.preventDefault();
    });
    const handleKnobLinkHover = jest.fn();

    render(
      <KnobNav
        hoverLink="HOME"
        activeLink="HOME"
        handleKnobClick={handleKnobClick}
        handleKnobLinkHover={handleKnobLinkHover}
      />
    );

    await user.click(screen.getByRole('link', { name: 'ABOUT' }));

    expect(handleKnobClick).toHaveBeenCalledTimes(1);
    expect(clickedHref).toBe('/#about');
  });

  it('marks the active section link', () => {
    render(
      <KnobNav
        hoverLink="MUSIC"
        activeLink="MUSIC"
        handleKnobClick={jest.fn()}
        handleKnobLinkHover={jest.fn()}
      />
    );

    expect(screen.getByRole('link', { name: 'MUSIC' })).toHaveClass(
      'active-link'
    );
    expect(screen.getByRole('link', { name: 'HOME' })).not.toHaveClass(
      'active-link'
    );
  });

  it('rotates the dial class based on hoverLink', () => {
    const { container } = render(
      <KnobNav
        hoverLink="BOOKING"
        activeLink="HOME"
        handleKnobClick={jest.fn()}
        handleKnobLinkHover={jest.fn()}
      />
    );

    expect(container.firstChild).toHaveClass('booking-rotate');
  });
});

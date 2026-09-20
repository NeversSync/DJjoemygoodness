import React from 'react';
import { render, screen } from '@testing-library/react';
import Music, { RELEASES, SPOTLIGHT_MIXES } from './Music';

jest.mock('./InstagramFeed', () => {
  return function MockInstagramFeed() {
    return <div>Instagram follow</div>;
  };
});

describe('Music press package', () => {
  it('presents the JoeMyGoodness label and Spotify discography links', () => {
    render(<Music />);

    expect(screen.getByText(/JoeMyGoodness LLC of Oregon/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Symphonic Distribution/i).length).toBeGreaterThan(
      0
    );
    expect(screen.getByText('Discography')).toBeInTheDocument();

    RELEASES.forEach((release) => {
      expect(screen.getByText(release.title)).toBeInTheDocument();
    });

    const spotifyLinks = screen.getAllByRole('link', {
      name: 'Listen on Spotify',
    });
    expect(spotifyLinks.map((link) => link.getAttribute('href'))).toEqual([
      'https://open.spotify.com/album/4Rsmk8IsZydwDfjKTkUhDy',
      'https://open.spotify.com/album/2FEIOXYfzTy6ZJ7EFH3BWR',
      'https://open.spotify.com/album/3mK16yClrRrrx7wELDgXa7',
    ]);
  });

  it('embeds the first four SoundCloud Spotlight mixes in order', () => {
    render(<Music />);

    const players = screen.getAllByTitle(/on SoundCloud$/);
    expect(players).toHaveLength(SPOTLIGHT_MIXES.length);
    expect(players.map((frame) => frame.getAttribute('src'))).toEqual(
      SPOTLIGHT_MIXES.map(
        (mix) =>
          `https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/joe-good-1/${mix.path}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`
      )
    );
  });
});

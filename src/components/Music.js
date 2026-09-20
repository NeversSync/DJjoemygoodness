import React from 'react';

import InstagramFeed from './InstagramFeed';
import {
  MusicCopy,
  MusicTitle,
  MusicWrapper,
  SoundcloudWrapper,
  DiscographyBlock,
  DiscographyHeading,
  ReleaseList,
  ReleaseItem,
  ReleaseTitle,
  ReleaseMeta,
  PlatformNote,
  InstagramSlot,
} from '../styles/music-styles';

const RELEASES = [
  {
    title: 'AfterImage',
    meta: 'Latest Release · Single · 2026',
    href: 'https://open.spotify.com/album/4Rsmk8IsZydwDfjKTkUhDy',
  },
  {
    title: 'Frogs on the Chaotic Lily Pad: Dulcet Harmonics',
    meta: '2025 · Single · with Josh Faber-Hammond · Live at KindleNW 2022',
    href: 'https://open.spotify.com/album/2FEIOXYfzTy6ZJ7EFH3BWR',
  },
  {
    title: 'Dulcet Harmonics',
    meta: '2024 · Album',
    href: 'https://open.spotify.com/album/3mK16yClrRrrx7wELDgXa7',
  },
];

// First four Spotlight mixes on soundcloud.com/joe-good-1 (Spotlight is not a public set URL).
const SPOTLIGHT_MIXES = [
  {
    title: 'Dulcet Harmonics @ Kindle 2026 - Dawn to Bubbles',
    path: 'dulcet-harmonics-kindle-2026',
  },
  {
    title: 'Soak 2026 - Gangster Sunrise',
    path: 'soak-2026-gangster-sunrise',
  },
  {
    title: 'Soak 2026 - Not to Scale: Conclave Mix',
    path: 'soak-2026-not-to-scale',
  },
  {
    title: 'Soak 2026 - Not to Scale: Drum & Bangers',
    path: 'soak-2026-not-to-scale-drum',
  },
];

const soundcloudPlayerSrc = (path) =>
  `https://w.soundcloud.com/player/?url=https%3A//soundcloud.com/joe-good-1/${path}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;

const Music = () => (
  <div>
    <MusicWrapper id="music">
      <MusicTitle>MUSIC</MusicTitle>
      <SoundcloudWrapper>
        {SPOTLIGHT_MIXES.map((mix) => (
          <iframe
            key={mix.path}
            width="100%"
            height="166"
            scrolling="no"
            frameBorder="no"
            allow="autoplay"
            title={`${mix.title} on SoundCloud`}
            src={soundcloudPlayerSrc(mix.path)}
          />
        ))}
      </SoundcloudWrapper>
      <MusicCopy>
        <strong>JoeMyGoodness</strong> is an independent record label operated
        by JoeMyGoodness LLC of Oregon—releasing original productions and
        collaborations under the JoeMyGoodness imprint. Releases are distributed
        via Symphonic Distribution to Spotify, Apple Music, YouTube Music, and
        other major platforms.
        <br />
        <br />
        As a DJ and live performer, Joe blends electronic bass with live trumpet
        for festivals, weddings, clubs, and radio. He also serves as Musical
        Talent Coordinator for Pacific Fire Gathering, with experience across
        wedding, corporate, radio, club, and festival production.
      </MusicCopy>
      <DiscographyBlock>
        <DiscographyHeading>Discography</DiscographyHeading>
        <ReleaseList>
          {RELEASES.map((release) => (
            <ReleaseItem key={release.title}>
              <ReleaseTitle>{release.title}</ReleaseTitle>
              <ReleaseMeta>{release.meta}</ReleaseMeta>
              <a
                href={release.href}
                target="_blank"
                rel="noopener noreferrer"
                className="custom-link"
              >
                Listen on Spotify
              </a>
            </ReleaseItem>
          ))}
        </ReleaseList>
        <PlatformNote>
          Also on Apple Music and YouTube Music via Symphonic Distribution ·{' '}
          <a
            href="https://soundcloud.com/joe-good-1"
            target="_blank"
            rel="noopener noreferrer"
          >
            DJ mixes on SoundCloud
          </a>
        </PlatformNote>
      </DiscographyBlock>
      <InstagramSlot>
        <InstagramFeed />
      </InstagramSlot>
    </MusicWrapper>
  </div>
);

export default Music;
export { RELEASES, SPOTLIGHT_MIXES };

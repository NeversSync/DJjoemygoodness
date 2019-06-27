import styled from 'styled-components';
import { Wrapper, SubTitle, ImageWrapper, Copy, Card } from '../components/Helpers';

const MusicWrapper = styled(Wrapper)`
  background-color: var(--dark-purple-background);
  grid-template-rows: 10vh auto auto auto auto 10vh;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-gap: 1em;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='46' viewBox='0 0 70 46'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpolygon points='68 44 62 44 62 46 56 46 56 44 52 44 52 46 46 46 46 44 40 44 40 46 38 46 38 44 32 44 32 46 26 46 26 44 22 44 22 46 16 46 16 44 12 44 12 46 6 46 6 44 0 44 0 42 8 42 8 28 6 28 6 0 12 0 12 28 10 28 10 42 18 42 18 28 16 28 16 0 22 0 22 28 20 28 20 42 28 42 28 28 26 28 26 0 32 0 32 28 30 28 30 42 38 42 38 0 40 0 40 42 48 42 48 28 46 28 46 0 52 0 52 28 50 28 50 42 58 42 58 28 56 28 56 0 62 0 62 28 60 28 60 42 68 42 68 0 70 0 70 46 68 46'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), linear-gradient(hsla(240, 53%, 15%, 1), hsla(22, 94%, 58%, .9));

  @media(min-width: 1200px) {
    grid-gap: 1.5em;
    grid-template-columns: repeat(12, 1fr);
    grid-template-rows: 15vh auto auto auto auto 15vh;
  }
`;

const MusicTitle = styled(SubTitle)`
  grid-column: 1 / 2;
  grid-row: 2 / 3;
  justify-self: end;
  margin-top: 40px;
  margin-right: -30px;
  align-self: start;
  height: fit-content;
  transform: rotate(-90deg);

  @media(min-width: 1200px) {
    grid-column: 2 / 3;
    grid-row: 2 / 3;
    margin-right: -40px;
  }
`;

const MusicCopy = styled(Copy)`
  grid-column: 1 / -1;
  grid-row: 3 / 4;
  width: 85%;
  justify-self: center;

  @media(min-width: 1200px) {
    grid-column: 3 / 11;
    max-width: 700px;
  }
`;

const MusicImageWrapper = styled(ImageWrapper)`
  grid-column: 1 / -1;
  grid-row: 1 / 2;

  @media(min-width: 1200px) {
   grid-column: 4 / 6;
   grid-row: 2 / 3;
   width: 100%;
   justify-self: center;
   align-self: start;
  }
`;

const SoundcloudWrapper = styled(Card)`
  box-shadow: 5px 5px 15px rgba(255, 255, 255, 0.2);
  grid-column: 2 / 6;
  grid-row: 2 / 3;
  height: 140px;

  @media (min-width: 1200px) {
    grid-row: 2 / 3;
    grid-column: 3 / 11;
    width: 80%;
    justify-self: center;
  }
  `;

const MusicYoutubeWrapper = styled(Card)`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 */
  padding-top: 25px;
	height: 0;
  box-shadow: 5px 5px 15px rgba(255, 255, 255, 0.2);
  grid-column: 2 / 6;
  grid-row: 4 / 5;

  @media (min-width: 1200px) {
    grid-column: 4 / 10;
    grid-row: 4 / 5;
  }
`;

export { MusicCopy, MusicImageWrapper, MusicTitle, MusicWrapper, SoundcloudWrapper, MusicYoutubeWrapper };

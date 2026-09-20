import Link from 'next/link';
import styled from 'styled-components';

/**
 * Labels sit on one circle centered on the dial, from 12 o'clock to 4 o'clock.
 * CSS transform order: rotate(θ) then translateY(-R) places θ=0 at 12 o'clock
 * and positive θ clockwise (30° steps → 4 o'clock at 120°).
 * Text is rotated an extra -90deg (original tangential look); the start of each
 * phrase is anchored on the circle (transform-origin: left center).
 */
export const DIAL_LABEL_ANGLES_DEG = [0, 30, 60, 90, 120];

const Knob = styled.div`
  --dial-size: 150px;
  /* Prior radius was 0.76; +20% → 0.912 of dial size. */
  --dial-label-radius: calc(var(--dial-size) * 0.912);
  display: grid;
  justify-self: center;
  align-self: center;
  position: relative;
  width: var(--dial-size);
  height: var(--dial-size);
  transform: scale(0.8);
  background-color: #6b6b6b;
  border-radius: 50%;
  box-shadow: inset -2px 2px 0px 0px rgba(255, 255, 255, 0.1),
    inset 2px -2px 0px 0px rgba(17, 17, 17, 0.2), -5px 5px 5px 0px #111,
    -10px 10px 10px -5px #111, -20px 20px 20px -10px #111,
    -25px 25px 25px -10px #111;

  @media (min-width: 1200px) {
    --dial-size: 250px;
  }

  @media (max-width: 900px) and (orientation: landscape) {
    transform: scale(1);
  }

  &::after {
    position: absolute;
    top: 50%;
    left: 75%;
    width: 25%;
    height: 4px;
    margin-top: -2px;
    background-color: var(--link-color);
    box-shadow: 0 0 5px 5px hsla(204, 45%, 62%, 0.15);
    border-radius: 2px;
    transition: all 200ms ease-in-out;
    transform-origin: -100% 50%;
    content: '';
  }
`;

/** Zero-size ray from dial center; angle aims at the clock position. */
const KnobNavSpoke = styled.span`
  position: absolute;
  left: 50%;
  top: 50%;
  width: 0;
  height: 0;
  transform: rotate(var(--label-angle));
`;

const KnobNavLink = styled(Link)`
  position: absolute;
  left: 0;
  top: 0;
  color: var(--link-color);
  white-space: nowrap;
  /* Start of the phrase sits on the guide circle; text stays tangential (-90deg). */
  transform-origin: left center;
  transform: translate(0, calc(-1 * var(--dial-label-radius)))
    translate(0, -50%) rotate(-90deg);

  h3 {
    margin: 0;
    transition: all 200ms ease-in-out;
    font-size: 0.7em;

    &:hover,
    &:active {
      color: var(--hover-color);
      transform: scale(1.1);
    }

    @media (min-width: 1200px) {
      font-size: 0.8em;
    }
  }
`;

const KnobNavSpoke1 = styled(KnobNavSpoke)`
  --label-angle: 0deg;
`;
const KnobNavSpoke2 = styled(KnobNavSpoke)`
  --label-angle: 30deg;
`;
const KnobNavSpoke3 = styled(KnobNavSpoke)`
  --label-angle: 60deg;
`;
const KnobNavSpoke4 = styled(KnobNavSpoke)`
  --label-angle: 90deg;
`;
const KnobNavSpoke5 = styled(KnobNavSpoke)`
  --label-angle: 120deg;
`;

export {
  Knob,
  KnobNavSpoke,
  KnobNavLink,
  KnobNavSpoke1,
  KnobNavSpoke2,
  KnobNavSpoke3,
  KnobNavSpoke4,
  KnobNavSpoke5,
};

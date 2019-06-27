import Link from 'gatsby-link';
import styled from 'styled-components';

const Knob = styled.div`
  display: grid;
  justify-self: center;
  align-self: center;
  position: relative;
  width: 150px;
  height: 150px;
  transform: scale(.8);
  background-color: #6b6b6b;
  border-radius: 50%;
  box-shadow: inset -2px 2px 0px 0px rgba(255, 255, 255, 0.1),
    inset 2px -2px 0px 0px rgba(17, 17, 17, 0.2), -5px 5px 5px 0px #111,
    -10px 10px 10px -5px #111, -20px 20px 20px -10px #111,
    -25px 25px 25px -10px #111;

  @media (min-width: 1200px) {
    width: 250px;
    height: 250px;
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

const KnobNavLink = styled(Link)`
  position: absolute;

  h3 {
    transition: all 200ms ease-in-out;
    font-size: .7em;
    &:hover, &:active {
      color: var(--hover-color);
      transform: scale(1.1);
    }
    @media(min-width: 1200px) {
    font-size: .8em
    }
  }
`;

const KnobNavLink1 = styled(KnobNavLink)`
  color: var(--link-color);
  transform: rotate(-90deg);
  top: -105px;
  right: 50px;

  @media(min-width: 1200px) {
    top: -122px;
    right: 96px;
  }
  `;

const KnobNavLink2 = styled(KnobNavLink)`
  top: -104px;
  right: -4px;
  transform: rotate(-69deg);

  @media(min-width: 1200px) {
    top: -115px;
    right: 16px;
    transform: rotate(-67deg);
  }
  `;

const KnobNavLink3 = styled(KnobNavLink)`
  top: -82px;
  right: -48px;
  transform: rotate(-48deg);
  `;

const KnobNavLink4 = styled(KnobNavLink)`
  top: -65px;
  right: -149px;
  transform: rotate(-36deg);

  @media(min-width: 1200px) {
    top: -54px;
    right: -179px;
    transform: rotate(-33deg);
  }
  `;

const KnobNavLink5= styled(KnobNavLink)`
    top: 0px;
    right: -120px;
    transform: rotate(-17deg);

  @media(min-width: 1200px) {
    top: 30px;
    right: -152px;
    transform: rotate(-20deg);
  }
`;

export { Knob, KnobNavLink, KnobNavLink1, KnobNavLink2, KnobNavLink3, KnobNavLink4, KnobNavLink5 };

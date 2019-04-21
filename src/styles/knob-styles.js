import styled from 'styled-components';

const Knob = styled.div`
  display: grid;
  justify-self: center;
  align-self: center;
  position: relative;
  width: 150px;
  height: 150px;
  background-color: #6b6b6b;
  border-radius: 50%;
  box-shadow: inset -2px 2px 0px 0px rgba(255, 255, 255, .1),
              inset 2px -2px 0px 0px rgba(17, 17, 17, .2),
              -5px 5px 5px 0px #111,
              -10px 10px 10px -5px #111,
              -20px 20px 20px -10px #111,
              -25px 25px 25px -10px #111;
  
  @media(min-width: 1200px) {
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
    box-shadow: 0 0 5px 5px hsla(204, 45%, 62%, .15);
    border-radius: 2px;
    transition: all 200ms ease-in-out;
    transform: rotate(-90deg);
    transform-origin: -100% 50%;
    content: "";
  }
`;

const KnobNavLink = styled.a`
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
    top: -114px;
    right: 16px;
    transform: rotate(-63deg);
  }            
  `;

const KnobNavLink3 = styled(KnobNavLink)`
  top: -79px;
  right: -45px;
  transform: rotate(-47deg);
  `;

const KnobNavLink4 = styled(KnobNavLink)`
  top: -65px;
  right: -149px;
  transform: rotate(-36deg);
  
  @media(min-width: 1200px) {
    top: -51px;
    right: -175px;
    transform: rotate(-31deg);
  }            
  `;

const KnobNavLink5= styled(KnobNavLink)`
    top: 0px;
    right: -120px;
    transform: rotate(-17deg);
  
  @media(min-width: 1200px) {
    top: 33px;
    right: -141px;
    transform: rotate(-16deg);
  }            
`;

export { Knob, KnobNavLink, KnobNavLink1, KnobNavLink2, KnobNavLink3, KnobNavLink4, KnobNavLink5 };
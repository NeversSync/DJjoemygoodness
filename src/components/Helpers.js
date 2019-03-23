import React from 'react';
import styled from 'styled-components';
// import Scrollchor from 'react-scrollchor';

const Wrapper = styled.div`
  display: grid;
  background: white;
`;

const Copy = styled.p`
  font-family: 'Rubik', sans-serif; 
  font-size: 1em;
  line-height: 32px;
  letter-spacing: 1.75px;
  font-weight: 300;

  @media (min-width: 900px) {
    font-size: 1.2em;
  }
`;

const Card = styled.div`
  box-shadow: 0 5px 15px rgba(50, 50, 93, 0.1), 0 3px 8px rgba(0, 0, 0, 0.07);
  background: white;
  border-radius: 4px;
  `;

const ImageWrapper = styled.div`
  display: grid;
`;

const Title = styled.h1`
  font-size: 1em;
  letter-spacing: 3px;
  font-family: 'Sedgwick Ave Display', cursive;

  @media (min-width: 1100px) {
    font-size: 1.4em;
  }
`;

const SubTitle = styled.h3`
  font-size: 42px;
  letter-spacing: 20px;
  font-weight: 200;

  @media (max-width: 1100px) {
    font-size: 20px;
  }
`;

const CTAButtonText = styled.p`
  color: white;
`;

const CTAButton = styled.button`
  font-size: 16px;
  margin-top: 30px;
  display: flex;
  justify-content: space-evenly;
  align-items: center; 
  width: 200px;
  height: 55px;
  background: linear-gradient(to left, hsla(348, 86%, 59%, .9), hsla(39, 100%, 63%, 0.9));
  border: none;
  border-radius: 7px;
  border-bottom: 3px solid hsla(348, 2%, 10%, .5);
  box-shadow: 0px 2px 3px -1px rgba(0, 0, 0, 0.3);
  transition: .3s ease;
  letter-spacing: 1.8px;
  cursor: pointer;

  &:hover {
    background: linear-gradient(to left, hsla(348, 96%, 69%, .9), hsla(39, 100%, 63%, 0.9));
    box-shadow: 0 4px 4px rgba(0,0,0,.25);
  }
  &:active {
    background: linear-gradient(to left, hsla(348, 86%, 49%, .9), hsla(39, 90%, 43%, 0.9));
    -webkit-transform: translate(0px, 2px);
    transform: translate(0px, 2px);
    border-bottom: none;
    box-shadow: none;
  }

  @media(max-width: 900px) {
    margin: 0;
    font-size: 16px;
    &:hover {
      background: linear-gradient(to left, hsla(348, 86%, 59%, .9), hsla(39, 100%, 63%, 0.9));
      box-shadow: 0px 2px 3px -1px rgba(0, 0, 0, 0.3);
    }
  }
`;


const Spacer = styled.div`
  grid-column: 1 / -1;
  width: 100%;
  margin: 1%;

   @media(max-width: 900px) {
     display: none;
  }
`;

const Testimonial = styled.div`
font-style: italic;
font-size: 22px;
font-weight: 200;
line-height: 32px;
letter-spacing: 1.55px;
text-align: center;

@media (max-width: 1100px) {
    font-size: 18px;
  }
`;

// HELPER COMPONENTS

const SVGArrowRight = () => (
  <CTAButton className="arrow"><CTAButtonText>LEARN MORE</CTAButtonText>
    <svg style={{ width: '30px', height: '30px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 453.5 270">
      <g id="Layer_2" data-name="Layer 2">
        <path id="arrow-head" fill="none" stroke="#fff" strokeWidth="20" d="M318.5 10l125 125-125 125" strokeLinecap="round" strokeLinejoin="round" />
        <path id="arrow-body" fill="white" stroke="white" strokeWidth="" strokeMiterlimit="0" d="M433 144.5H10a10 10 0 0 1 0-20h423a10 10 0 0 1 0 20z" />
      </g>
    </svg>
  </CTAButton>
);

const HomeButton = () => (
  <CTAButton className="arrow">
    <CTAButtonText>HOME</CTAButtonText>
    <svg className="svg-left-arrow" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 453.5 270">
      <g id="Layer_2" data-name="Layer 2">
        <path id="arrow-head" fill="none" stroke="#fff" strokeWidth="20" d="M318.5 10l125 125-125 125" strokeLinecap="round" strokeLinejoin="round" />
        <path id="arrow-body" fill="white" stroke="white" strokeWidth="" strokeMiterlimit="0" d="M433 144.5H10a10 10 0 0 1 0-20h423a10 10 0 0 1 0 20z" />
      </g>
    </svg>
  </CTAButton>
);

// const UpArrow = () => (
//   <Scrollchor to="#" animate={{ duration: 1250 }} className='arrow up-button'>
//     <svg className='up-arrow' style={{ width: '30px', height: '30px' }} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 453.5 270">
//       <g id="Layer_2" data-name="Layer 2">
//         <path id="arrow-head" fill="none" stroke="#000" strokeWidth="20" d="M318.5 10l125 125-125 125" strokeLinecap="round" strokeLinejoin="round" />
//         <path id="arrow-body" fill="black" stroke="black" strokeWidth="" strokeMiterlimit="0" d="M433 144.5H10a10 10 0 0 1 0-20h423a10 10 0 0 1 0 20z" />
//       </g>
//     </svg>
//   </Scrollchor>
// );

export { Wrapper, Title, SubTitle, Copy, Card, CTAButton, Testimonial, SVGArrowRight, HomeButton, ImageWrapper, Spacer };
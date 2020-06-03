import React from 'react';
import Link from 'gatsby-link';
import {Title} from '../components/Helpers';
import { HomeButton } from '../styles/pastExperience-styles';


const Thanks = () => (
  <div style={{display: 'grid', minHeight: '85vh', justifyContent: 'center', alignContent: 'center', color: '#292929'}}>
    <Title>Thank you! We will be in touch shortly.</Title>
    <HomeButton to='/'>
        HOME
    </HomeButton>
  </div>
);

export default Thanks;

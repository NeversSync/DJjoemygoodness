import React from 'react';
import { render, screen } from '@testing-library/react';
import SideProjects, { TECH_SKILLS } from './SideProjects';

describe('SideProjects portfolio', () => {
  it('features Equilateral Expedition with technical skills and evidence video', () => {
    render(<SideProjects />);

    expect(screen.getByText('Equilateral Expedition')).toBeInTheDocument();
    expect(screen.getByText('Geometric Geodes')).toBeInTheDocument();
    expect(screen.getByText('Atomic Flow')).toBeInTheDocument();
    expect(screen.getByText('Cuddlefish Artcar')).toBeInTheDocument();

    TECH_SKILLS.forEach((skill) => {
      expect(screen.getByText(skill)).toBeInTheDocument();
    });

    expect(
      screen.getByTitle('Equilateral Expedition technical practice')
    ).toHaveAttribute('src', 'https://www.youtube.com/embed/uzq_yZsplc8');

    expect(screen.getByTitle('Atomic Flow performance')).toHaveAttribute(
      'src',
      'https://www.youtube.com/embed/w8Hita6MBsQ'
    );

    expect(
      screen.getByRole('link', { name: '@geometric_geodes' })
    ).toHaveAttribute('href', 'https://www.instagram.com/geometric_geodes/');

    expect(
      screen.getByRole('link', { name: '@equilateralexpedition' })
    ).toHaveAttribute(
      'href',
      'https://www.instagram.com/equilateralexpedition/'
    );
  });
});

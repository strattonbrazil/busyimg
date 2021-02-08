import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

test('renders home header', () => {
  render(<App />);
  const linkElement = screen.getByText(/Video Game Legends/i);
  expect(linkElement).toBeInTheDocument();
});

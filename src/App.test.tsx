import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

beforeEach(() => {
  const script = document.createElement('script');
  document.body.appendChild(script);
})

test('renders home header', () => {
  render(<App />);
  const linkElement = screen.getByText(/Video Game Legends/i);
  expect(linkElement).toBeInTheDocument();
});

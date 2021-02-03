import { render, screen } from '@testing-library/react';
import App from './App';
import React from 'react';

test('renders home header', () => {
  render(<App />);
  const linkElement = screen.getByText(/Home/i);
  expect(linkElement).toBeInTheDocument();
});

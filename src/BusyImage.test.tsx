import { render, screen } from '@testing-library/react';
import { BusyImage, parseNameOrigin } from './BusyImage';
import React from 'react';

test('renders home header', () => {
  // render(<App />);
  // const linkElement = screen.getByText(/Home/i);
  // expect(linkElement).toBeInTheDocument();
});

test('splits name and origin', () => {
  const [name1,origin1] = parseNameOrigin("foo");
  expect(name1).toBe("foo");
  expect(origin1).toBe(null);

  const [name2,origin2] = parseNameOrigin("foo(gnarfle)");
  expect(name2).toBe("foo");
  expect(origin2).toBe("(gnarfle)");
});





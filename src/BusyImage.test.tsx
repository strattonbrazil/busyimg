import { render, screen } from '@testing-library/react';
import { BusyImage, parseNameOrigin } from './BusyImage';
import React from 'react';

test('splits name and origin', () => {
  const partLabel1 = parseNameOrigin("terminator");
  expect(partLabel1.name).toBe("terminator");
  expect(partLabel1.origin).toBe(null);

  const partLabel2 = parseNameOrigin("foo(gnarfle)");
  expect(partLabel2.name).toBe("foo");
  expect(partLabel2.origin).toBe("gnarfle");

  const partLabel3 = parseNameOrigin("john(paul)jones");
  expect(partLabel3.name).toBe("john");
  expect(partLabel3.origin).toBe("paul");
  expect(partLabel3.year).toBe("jones");
});





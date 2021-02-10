import { render, screen } from '@testing-library/react';
import { ImageList } from './ImageList';
import Metadata from './Metadata';

import React from 'react';

test('creates tiles', () => {
    const ms = {
        metadata: [{
            title: "Pretty Picture 1",
            subpath: "abc",
            creator: "",
            creatorLink: "",
            areas: []
        }, {
            title: "Pretty Picture 2",
            subpath: "def",
            creator: "",
            creatorLink: "",
            areas: []
        }]
    };
    render(<ImageList ms={ms} imageId="foo" />);

    const labelElement1 = screen.getByText("Pretty Picture 1");
    expect(labelElement1).toBeInTheDocument();

    const labelElement2 = screen.getByText("Pretty Picture 2");
    expect(labelElement2).toBeInTheDocument();
});

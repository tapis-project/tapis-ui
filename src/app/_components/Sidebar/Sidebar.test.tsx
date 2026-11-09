import React from 'react';
import renderComponent from 'testing/utils';
import Sidebar from 'app/_components/Sidebar';

// Stub the extension seam: importing the real module pulls every initialized
// extension's built dist (react-leaflet et al., ESM jest can't parse) into
// jsdom — same stub Login.test.tsx uses.
jest.mock('extensions', () => ({
  useExtension: () => ({ extension: undefined, extensionName: undefined }),
}));

describe('Sidebar', () => {
  it('renders only the Login item before login', () => {
    // Pre-login the classic sidebar is the Login item alone — the Dashboard
    // item only rendered a bounce to /login, so it's gone until sign-in.
    const { getAllByText, queryAllByText } = renderComponent(<Sidebar />);
    expect(getAllByText(/Login/).length).toEqual(1);
    expect(queryAllByText(/Dashboard/).length).toEqual(0);
  });
});

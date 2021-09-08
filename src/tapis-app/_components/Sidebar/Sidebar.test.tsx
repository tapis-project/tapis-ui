import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import Sidebar from 'tapis-app/_components/Sidebar';

describe('Sidebar', () => {
  it('renders Sidebar component', () => {
    const { getAllByText } = renderComponent(<Sidebar />);
    expect(getAllByText(/Dashboard/).length).toEqual(1);
  });
});

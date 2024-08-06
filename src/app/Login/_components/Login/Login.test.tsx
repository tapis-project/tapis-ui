import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'testing/utils';
import Login from './Login';

describe('Login', () => {
  it('renders Login component', () => {
    const { getAllByText } = renderComponent(<Login />);
    expect(getAllByText(/Username/).length).toEqual(1);
  });
});

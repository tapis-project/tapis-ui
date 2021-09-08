import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import App from 'tapis-app/_Layout';

describe('App', () => {
  it('renders main App component', () => {
    const component = renderComponent(<App />);
    expect(component).toBeDefined();
  });
});

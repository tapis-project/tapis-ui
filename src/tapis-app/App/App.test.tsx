import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import App from 'tapis-app/App';

describe('App', () => {
  it('renders main App component', () => {
    const component = renderComponent(<App />);
    expect(component).toBeDefined();
  });
});

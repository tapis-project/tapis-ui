import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import App from './App';
import tapisReduxStore from 'tapis-redux';

const mockStore = configureStore();

describe('App', () => {
  it('renders main App component', () => {
    const store = mockStore(tapisReduxStore);
    const component = renderComponent(<App />, store);
    expect(component).toBeDefined();
  });
});

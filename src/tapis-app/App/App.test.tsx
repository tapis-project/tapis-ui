import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import App from 'tapis-app/App';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('App', () => {
  it('renders main App component', () => {
    const store = mockStore(tapisReduxStore);
    const component = renderComponent(<App />, store);
    expect(component).toBeDefined();
  });
});

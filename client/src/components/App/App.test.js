import React from 'react';
import { render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import App from './App';
import tapisReduxStore from '../../tapis-redux/fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('App', () => {
  it('renders App', () => {
    const store = mockStore(tapisReduxStore);

    renderComponent(<App />, store);
  });
});
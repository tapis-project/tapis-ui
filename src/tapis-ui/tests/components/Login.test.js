import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../utils/testing';
import { Login } from 'tapis-redux/components';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('Login', () => {
  it('renders Login component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<Login />, store);
    expect(getAllByText(/Username/).length).toEqual(1);
  });
});

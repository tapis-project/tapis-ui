import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import Systems from './Systems';
import tapisReduxStore from '../../tapis-redux/fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('Systems', () => {
  it('renders Login component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<Login />, store);
    expect(getAllByText(/password/).length).toEqual(1);
  });
});
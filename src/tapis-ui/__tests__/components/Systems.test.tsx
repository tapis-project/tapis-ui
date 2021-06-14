import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../utils/testing';
import { Systems } from 'tapis-ui/components';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('Systems', () => {
  it('renders Systems component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<Systems />, store);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
});

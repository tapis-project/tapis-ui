import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../utils/testing';
import { SystemList } from 'tapis-ui/src/components/systems';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('SystemList', () => {
  it('renders SystemList component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<SystemList />, store);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
});

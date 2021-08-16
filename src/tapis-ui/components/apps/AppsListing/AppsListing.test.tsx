import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { AppsListing } from 'tapis-ui/components/apps';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('Apps', () => {
  it('renders AppsListing component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<AppsListing />, store);
    expect(getAllByText(/SleepSeconds/).length).toEqual(1);
  });
});

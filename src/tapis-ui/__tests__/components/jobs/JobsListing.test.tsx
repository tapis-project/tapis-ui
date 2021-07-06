import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../utils/testing';
import { JobsListing } from 'tapis-ui/components/jobs';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('JobsListing', () => {
  it('renders JobsListing component', () => {
    const store = mockStore(tapisReduxStore);

    const { getAllByText } = renderComponent(<JobsListing />, store);
    expect(getAllByText(/SleepSeconds/).length).toEqual(1);
  });
});

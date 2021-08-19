import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { AppsListing } from 'tapis-ui/components/apps';
import { useList } from 'tapis-hooks/apps';
import { tapisApp } from 'fixtures/apps.fixtures';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

jest.mock('tapis-hooks/apps');

describe('Apps', () => {
  it('renders AppsListing component', () => {
    const store = mockStore(tapisReduxStore);
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [ tapisApp ],
      },
      isLoading: false,
      error: null
    })

    const { getAllByText } = renderComponent(<AppsListing />, store);
    expect(getAllByText(/SleepSeconds/).length).toEqual(1);
  });
});

import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { JobsListing } from 'tapis-ui/components/jobs';
import { useList } from 'tapis-hooks/jobs';
import { jobInfo } from 'fixtures/jobs.fixtures';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

jest.mock('tapis-hooks/jobs');

describe('JobsListing', () => {
  it('renders JobsListing component', () => {
    const store = mockStore(tapisReduxStore);

    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [ jobInfo ],
      },
      isLoading: false,
      error: null
    })

    const { getAllByText } = renderComponent(<JobsListing />, store);
    expect(getAllByText(/SleepSeconds/).length).toEqual(1);
  });
});

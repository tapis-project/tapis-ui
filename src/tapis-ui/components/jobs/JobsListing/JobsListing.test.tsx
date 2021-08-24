import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { JobsListing } from 'tapis-ui/components/jobs';
import { useList } from 'tapis-hooks/jobs';
import { jobInfo } from 'fixtures/jobs.fixtures';

jest.mock('tapis-hooks/jobs');

describe('JobsListing', () => {
  it('renders JobsListing component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [ jobInfo ],
      },
      isLoading: false,
      error: null
    })

    const { getAllByText } = renderComponent(<JobsListing />);
    expect(getAllByText(/SleepSeconds/).length).toEqual(1);
  });
});

import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import JobsNav from './JobsNav';
import { useList } from 'tapis-hooks/jobs';
import { jobInfo } from 'fixtures/jobs.fixtures';

jest.mock('tapis-hooks/jobs');

describe('JobsNav', () => {
  it('renders JobsNav component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [jobInfo],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<JobsNav />);
    expect(getAllByText(/SleepSeconds/).length).toEqual(1);
  });
});

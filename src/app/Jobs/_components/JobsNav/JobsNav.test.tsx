import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'testing/utils';
import JobsNav from './JobsNav';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { jobInfo } from 'fixtures/jobs.fixtures';

jest.mock('@tapis/tapisui-hooks');

describe('JobsNav', () => {
  it('renders JobsNav component', () => {
    (Hooks.useList as jest.Mock).mockReturnValue({
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

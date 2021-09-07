import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import JobLauncher  from './JobLauncher';
import { useList } from 'tapis-hooks/systems';
import { tapisSystem } from 'fixtures/systems.fixtures';

jest.mock('tapis-hooks/systems');

describe('JobLauncher', () => {
  it('renders JobsListing component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [tapisSystem],
      },
    });
    const { getAllByTestId } = renderComponent(
      <JobLauncher
        appId="SleepSeconds"
        appVersion="0.1"
        name="test-job"
        execSystemId="exec-system "
      />
    );
    const input: any = getAllByTestId('appId');
    expect(input[0].value).toEqual('SleepSeconds');
  });
});

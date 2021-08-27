import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { JobLauncher } from 'tapis-ui/components/jobs';
import { Jobs } from '@tapis/tapis-typescript';

describe('JobLauncher', () => {
  it('renders JobsListing component', () => {
    const appId = "SleepSeconds";
    const appVersion = "0.0.1";
    const initialValues: Jobs.ReqSubmitJob = {
      appId,
      appVersion,
      name: `Mock Job`,
      execSystemId: 'tapisv3-exec'
    }
    const { getAllByTestId } = renderComponent(
      <JobLauncher appId="SleepSeconds" appVersion="0.1" name="test-job" execSystemId="exec-system "/>
    );
    const input: any = getAllByTestId('appId');
    expect(input[0].value).toEqual('SleepSeconds');
  });
});

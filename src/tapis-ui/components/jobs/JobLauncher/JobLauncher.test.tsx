import React from 'react';
import configureStore from 'redux-mock-store';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { JobLauncher } from 'tapis-ui/components/jobs';
import { Jobs } from '@tapis/tapis-typescript';
import tapisReduxStore from 'fixtures/tapis-redux.fixture';

const mockStore = configureStore();

describe('JobLauncher', () => {
  it('renders JobsListing component', () => {
    const store = mockStore(tapisReduxStore);
    const appId = "SleepSeconds";
    const appVersion = "0.0.1";
    const initialValues: Jobs.ReqSubmitJob = {
      appId,
      appVersion,
      name: `Mock Job`,
      execSystemId: 'tapisv3-exec'
    }
    const { getAllByTestId } = renderComponent(
      <JobLauncher appId="SleepSeconds" appVersion="0.1" name="test-job" execSystemId="exec-system "/>,
      store
    );
    const input: any = getAllByTestId('appId');
    expect(input[0].value).toEqual('SleepSeconds');
  });
});

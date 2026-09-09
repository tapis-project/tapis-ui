import React from 'react';
import { screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import AppDetailsBox from './AppDetailsBox';

/** a before b, in document order */
const follows = (a: HTMLElement, b: HTMLElement) =>
  Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);

describe('AppDetailsBox', () => {
  it('is titled for what it details', () => {
    renderComponent(<AppDetailsBox app={{ jobType: 'FORK' }} />);
    expect(screen.getByText('App Details')).toBeInTheDocument();
  });

  it('says what the app is, in the record’s values', () => {
    renderComponent(
      <AppDetailsBox
        app={{
          jobType: 'BATCH',
          runtime: 'SINGULARITY',
          runtimeVersion: '3.7',
          runtimeOptions: ['SINGULARITY_RUN'],
          containerImage: 'docker://tacc/flexserv:1.4',
        }}
      />
    );
    ['job type', 'runtime', 'image'].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument()
    );
    expect(screen.getByText('BATCH')).toBeInTheDocument();
    expect(screen.getByText('SINGULARITY')).toBeInTheDocument();
    // the version and options ride with the runtime, not rows of their own
    expect(screen.getByText(/version 3\.7/)).toBeInTheDocument();
    expect(screen.getByText('SINGULARITY_RUN')).toBeInTheDocument();
    // whose it is is the Sharing & Access box's answer
    expect(screen.queryByText('owner')).toBeNull();
  });

  it('leaves the service’s defaults to the JSON', () => {
    renderComponent(
      <AppDetailsBox
        app={{ maxJobs: -1, maxJobsPerUser: -1, strictFileInputs: false }}
      />
    );
    ['max jobs', 'max per user', 'strict inputs'].forEach((label) =>
      expect(screen.queryByText(label)).toBeNull()
    );
  });

  it('says a real limit as the record does, and what it limits', () => {
    renderComponent(
      <AppDetailsBox app={{ maxJobsPerUser: 2, strictFileInputs: true }} />
    );
    expect(screen.getByText('max per user')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText(/per person/)).toBeInTheDocument();
    expect(screen.getByText('strict inputs')).toBeInTheDocument();
  });

  it('puts where it runs between what it is and its limits', () => {
    renderComponent(
      <AppDetailsBox app={{ jobType: 'FORK', maxJobs: 4 }}>
        <span>the rows</span>
      </AppDetailsBox>
    );
    const rows = screen.getByText('the rows');
    expect(follows(screen.getByText('FORK'), rows)).toBe(true);
    expect(follows(rows, screen.getByText('max jobs'))).toBe(true);
  });
});

import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import JobAccessPanel, { byGrantee } from './JobAccessPanel';

jest.mock('@tapis/tapisui-hooks');

const mutation = (over: object = {}) => ({
  isLoading: false,
  isError: false,
  isSuccess: false,
  data: undefined,
  error: null,
  reset: jest.fn(),
  ...over,
});

let share: jest.Mock;
let unshare: jest.Mock;

const shares = (rows: Array<Jobs.JobShareListDTO> = []) =>
  (Hooks.useJobShare as jest.Mock).mockReturnValue({
    data: { result: rows },
    isLoading: false,
    error: null,
  });

beforeEach(() => {
  jest.clearAllMocks();
  share = jest.fn();
  unshare = jest.fn();
  (useTapisConfig as jest.Mock).mockReturnValue({
    claims: { 'tapis/username': 'cgarcia' },
  });
  shares();
  (Hooks.useShareJob as jest.Mock).mockReturnValue(mutation({ share }));
  (Hooks.useDeleteJobShare as jest.Mock).mockReturnValue(mutation({ unshare }));
});

const job = (over: object = {}) =>
  ({
    uuid: 'job-1',
    owner: 'cgarcia',
    tenant: 'tacc',
    ...over,
  } as Jobs.Job);

describe('byGrantee', () => {
  it('folds the service rows into one line per person', () => {
    // the service answers one row per (person, resource); nobody thinks
    // about their collaborators one permission at a time
    expect(
      byGrantee([
        { grantee: 'ana', jobResource: 'JOB_OUTPUT' },
        { grantee: 'ana', jobResource: 'JOB_HISTORY' },
        { grantee: 'bo', jobResource: 'JOB_OUTPUT' },
      ])
    ).toEqual([
      { grantee: 'ana', resources: ['JOB_OUTPUT', 'JOB_HISTORY'] },
      { grantee: 'bo', resources: ['JOB_OUTPUT'] },
    ]);
  });

  it('drops rows with no grantee rather than inventing a blank person', () => {
    expect(byGrantee([{ jobResource: 'JOB_OUTPUT' }])).toEqual([]);
  });
});

describe('what the box says', () => {
  it('names the owner, which is why the head line no longer does', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    expect(screen.getByText('cgarcia')).toBeInTheDocument();
    expect(screen.getByText('tacc')).toBeInTheDocument();
  });

  it('separates the submitter from the owner when they differ', () => {
    renderComponent(
      <JobAccessPanel job={job({ createdby: 'svc-pipeline' })} />
    );
    expect(screen.getByText(/submitted by svc-pipeline/)).toBeInTheDocument();
  });

  it('says plainly when a run is shared with no one', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    expect(screen.getByText(/this job is yours alone/)).toBeInTheDocument();
  });

  it('shows each person with the parts they hold', () => {
    shares([
      { grantee: 'ana', jobResource: 'JOB_OUTPUT' },
      { grantee: 'ana', jobResource: 'JOB_RESUBMIT_REQUEST' },
    ]);
    renderComponent(<JobAccessPanel job={job()} />);
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('output')).toBeInTheDocument();
    expect(screen.getByText('resubmit request')).toBeInTheDocument();
  });
});

describe('sharing a run', () => {
  it('sends the chosen parts with READ, not the whole job', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    fireEvent.click(screen.getByText('+ share'));
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'ana' },
    });
    fireEvent.click(screen.getByText('add'));
    expect(share).toHaveBeenCalledWith(
      {
        jobUuid: 'job-1',
        reqShareJob: {
          grantee: 'ana',
          // the default: what people mean by "let them see my run"
          jobResource: ['JOB_OUTPUT', 'JOB_HISTORY'],
          jobPermission: 'READ',
        },
      },
      expect.anything()
    );
  });

  it('lets the parts be chosen', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    fireEvent.click(screen.getByText('+ share'));
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'ana' },
    });
    // drop history, add the inputs
    fireEvent.click(screen.getByText('history'));
    fireEvent.click(screen.getByText('input'));
    fireEvent.click(screen.getByText('add'));
    expect(share.mock.calls[0][0].reqShareJob.jobResource).toEqual([
      'JOB_OUTPUT',
      'JOB_INPUT',
    ]);
  });

  it('will not send a share with nothing in it', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    fireEvent.click(screen.getByText('+ share'));
    fireEvent.change(screen.getByPlaceholderText('username'), {
      target: { value: 'ana' },
    });
    fireEvent.click(screen.getByText('output'));
    fireEvent.click(screen.getByText('history'));
    expect(screen.getByText('add')).toBeDisabled();
  });

  it('takes back everything for the person whose chip was dismissed', () => {
    // the service has no per-resource revoke — this is the whole grant
    shares([{ grantee: 'ana', jobResource: 'JOB_OUTPUT' }]);
    renderComponent(<JobAccessPanel job={job()} />);
    fireEvent.click(screen.getByTestId('CancelIcon'));
    expect(unshare).toHaveBeenCalledWith({ jobUuid: 'job-1', user: 'ana' });
  });
});

describe('the owner gate', () => {
  it('offers no presses to someone who is neither owner nor creator', () => {
    shares([{ grantee: 'ana', jobResource: 'JOB_OUTPUT' }]);
    renderComponent(<JobAccessPanel job={job({ owner: 'someone-else' })} />);
    expect(screen.queryByText('+ share')).toBeNull();
    expect(screen.queryByTestId('CancelIcon')).toBeNull();
    expect(
      screen.getByText(/Only someone-else can change/)
    ).toBeInTheDocument();
    // the sharing is still SHOWN — read-only is not blank
    expect(screen.getByText('ana')).toBeInTheDocument();
  });

  it('lets the submitter manage a run owned by someone else', () => {
    // the service allows the creator too, and pipelines submit as one user
    // on behalf of another all the time
    renderComponent(
      <JobAccessPanel
        job={job({ owner: 'someone-else', createdby: 'cgarcia' })}
      />
    );
    expect(screen.getByText('+ share')).toBeInTheDocument();
  });
});

describe('when the service refuses', () => {
  it('says what it said', () => {
    (Hooks.useShareJob as jest.Mock).mockReturnValue(
      mutation({ share, error: new Error('JOBS_SHARE_UNAUTH not yours') })
    );
    renderComponent(<JobAccessPanel job={job()} />);
    expect(screen.getByText(/JOBS_SHARE_UNAUTH not yours/)).toBeInTheDocument();
  });
});

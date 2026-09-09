import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs } from '@tapis/tapis-typescript';
import { Jobs as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import JobAccessPanel, { byGrantee, revokeHeadline } from './JobAccessPanel';

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
let refetch: jest.Mock;

const shares = (rows: Array<Jobs.JobShareListDTO> = []) =>
  (Hooks.useJobShare as jest.Mock).mockReturnValue({
    data: { result: rows },
    isLoading: false,
    error: null,
    refetch,
  });

/** what the Jobs service answers every revoke with today, verbatim */
const REVOKE_REFUSED =
  'JOBS_JOB_SHARE_SK_CLIENT_DELETE_ERROR Unable to delete all share information in SK for the job job-1 for user ana granted by jdoe in tenant public :edu.utexas.tacc.tapis.client.shared.exceptions.TapisClientException: TAPIS_NOT_FOUND hasPrivilege not found: grantor REFUSED';

beforeEach(() => {
  jest.clearAllMocks();
  share = jest.fn();
  unshare = jest.fn();
  refetch = jest.fn();
  (useTapisConfig as jest.Mock).mockReturnValue({
    claims: { 'tapis/username': 'jdoe' },
  });
  shares();
  (Hooks.useShareJob as jest.Mock).mockReturnValue(mutation({ share }));
  (Hooks.useDeleteJobShare as jest.Mock).mockReturnValue(mutation({ unshare }));
});

const job = (over: object = {}) =>
  ({
    uuid: 'job-1',
    owner: 'jdoe',
    tenant: 'tacc',
    ...over,
  } as Jobs.Job);

const openPicker = () => {
  fireEvent.click(screen.getByText('+ share'));
  fireEvent.change(screen.getByPlaceholderText('username'), {
    target: { value: 'ana' },
  });
};

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
    expect(screen.getByText('jdoe')).toBeInTheDocument();
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

  it('shows each person with the parts they hold, in the spec’s own names', () => {
    shares([
      { grantee: 'ana', jobResource: 'JOB_OUTPUT' },
      { grantee: 'ana', jobResource: 'JOB_RESUBMIT_REQUEST' },
    ]);
    renderComponent(<JobAccessPanel job={job()} />);
    expect(screen.getByText('ana')).toBeInTheDocument();
    expect(screen.getByText('JOB_OUTPUT')).toBeInTheDocument();
    expect(screen.getByText('JOB_RESUBMIT_REQUEST')).toBeInTheDocument();
  });

  it('says on hover what each held part lets them read', () => {
    // JOB_HISTORY is broader than its name: the service checks it for the
    // job record and its status as well as the history
    shares([{ grantee: 'ana', jobResource: 'JOB_HISTORY' }]);
    renderComponent(<JobAccessPanel job={job()} />);
    expect(
      screen.getByLabelText(/READ on the job itself: its record, its status/)
    ).toBeInTheDocument();
  });

  it('says a held part the service never acts on grants nothing', () => {
    shares([{ grantee: 'ana', jobResource: 'JOB_INPUT' }]);
    renderComponent(<JobAccessPanel job={job()} />);
    expect(screen.getByText('JOB_INPUT')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/does not act on this part today/)
    ).toBeInTheDocument();
  });

  it('does not invent a meaning for a part it does not know', () => {
    shares([{ grantee: 'ana', jobResource: 'JOB_SOMETHING_NEW' }]);
    renderComponent(<JobAccessPanel job={job()} />);
    expect(screen.getByText('JOB_SOMETHING_NEW')).toBeInTheDocument();
    expect(
      screen.getByLabelText(/one this page does not know yet/)
    ).toBeInTheDocument();
  });
});

describe('sharing a run', () => {
  it('sends the chosen parts with READ, not the whole job', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    openPicker();
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

  it('offers only the parts the service acts on', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    openPicker();
    expect(screen.getByText('JOB_OUTPUT')).toBeInTheDocument();
    expect(screen.getByText('JOB_HISTORY')).toBeInTheDocument();
    expect(screen.queryByText('JOB_INPUT')).toBeNull();
    expect(screen.queryByText('JOB_RESUBMIT_REQUEST')).toBeNull();
  });

  it('shows which parts are picked, and pressing flips it', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    openPicker();
    const output = () =>
      screen.getByText('JOB_OUTPUT').closest('[aria-pressed]');
    expect(output()).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByText('JOB_OUTPUT'));
    expect(output()).toHaveAttribute('aria-pressed', 'false');
  });

  it('lets the parts be chosen', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    openPicker();
    fireEvent.click(screen.getByText('JOB_HISTORY'));
    fireEvent.click(screen.getByText('add'));
    expect(share.mock.calls[0][0].reqShareJob.jobResource).toEqual([
      'JOB_OUTPUT',
    ]);
  });

  it('will not send a share with nothing in it', () => {
    renderComponent(<JobAccessPanel job={job()} />);
    openPicker();
    fireEvent.click(screen.getByText('JOB_OUTPUT'));
    fireEvent.click(screen.getByText('JOB_HISTORY'));
    expect(screen.getByText('add')).toBeDisabled();
  });

  it('takes back everything for the person whose chip was dismissed', () => {
    // the service has no per-resource revoke — this is the whole grant
    shares([{ grantee: 'ana', jobResource: 'JOB_OUTPUT' }]);
    renderComponent(<JobAccessPanel job={job()} />);
    fireEvent.click(screen.getByTestId('CancelIcon'));
    expect(unshare).toHaveBeenCalledWith(
      { jobUuid: 'job-1', user: 'ana' },
      expect.anything()
    );
  });

  it('re-reads who holds what once a revoke settles, failed or not', () => {
    shares([{ grantee: 'ana', jobResource: 'JOB_OUTPUT' }]);
    renderComponent(<JobAccessPanel job={job()} />);
    fireEvent.click(screen.getByTestId('CancelIcon'));
    unshare.mock.calls[0][1].onSettled();
    expect(refetch).toHaveBeenCalled();
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
      <JobAccessPanel job={job({ owner: 'someone-else', createdby: 'jdoe' })} />
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

  it('explains the revoke the Jobs service cannot do today', () => {
    shares([{ grantee: 'ana', jobResource: 'JOB_OUTPUT' }]);
    (Hooks.useDeleteJobShare as jest.Mock).mockReturnValue(
      mutation({ unshare, error: new Error(REVOKE_REFUSED) })
    );
    renderComponent(<JobAccessPanel job={job()} />);
    fireEvent.click(screen.getByTestId('CancelIcon'));
    expect(
      screen.getByText(/Nothing was taken back from ana/)
    ).toBeInTheDocument();
  });
});

describe('revokeHeadline', () => {
  it('names the missing-grantor refusal', () => {
    expect(revokeHeadline(REVOKE_REFUSED, 'ana')).toMatch(
      /^Nothing was taken back from ana: .*leaves out the grantor/
    );
  });

  it('leaves every other failure to speak for itself', () => {
    expect(
      revokeHeadline('JOBS_SHARE_UNAUTH not yours', 'ana')
    ).toBeUndefined();
  });
});

import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as SystemsHooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import SystemSummaryCard from './SystemSummaryCard';

jest.mock('@tapis/tapisui-hooks');
// the thirteen modals bring their own hook needs; the card only has to
// mount them closed
jest.mock('@tapis/tapisui-common', () => {
  const actual = jest.requireActual('@tapis/tapisui-common');
  const nothing = () => null;
  return {
    ...actual,
    AuthModal: nothing,
    GlobusAuthModal: nothing,
    DeleteSystemModal: nothing,
    CreateChildSystemModal: nothing,
    ShareSystemPublicModal: nothing,
    UnShareSystemPublicModal: nothing,
    SharingModal: nothing,
    PermissionsModal: nothing,
    ChangeOwnerModal: nothing,
    DisableSystemModal: nothing,
    EnableSystemModal: nothing,
    UpdateSystemModal: nothing,
    RemoveCredentialModal: nothing,
    HostEvalNavigationButton: nothing,
  };
});

const system = (over: object = {}): Systems.TapisSystem =>
  ({
    id: 'frontera',
    uuid: 'abc-123',
    systemType: 'LINUX',
    host: 'frontera.tacc.utexas.edu',
    port: 22,
    owner: 'cgarcia',
    enabled: true,
    isPublic: false,
    effectiveUserId: 'cgarcia',
    rootDir: '/home1',
    defaultAuthnMethod: 'PKI_KEYS',
    canExec: true,
    canRunBatch: true,
    jobWorkingDir: 'HOST_EVAL($SCRATCH)',
    jobRuntimes: [{ runtimeType: 'SINGULARITY' }],
    jobMaxJobs: 50,
    jobMaxJobsPerUser: 10,
    jobEnvVariables: [{ key: 'FOO', value: 'bar' }],
    batchScheduler: 'SLURM',
    batchDefaultLogicalQueue: 'normal',
    batchLogicalQueues: [
      { name: 'normal', hpcQueueName: 'normal-q' },
      { name: 'development', hpcQueueName: 'dev-q' },
    ],
    tags: ['hpc', 'tacc'],
    notes: {},
    ...over,
  } as never);

const renderCard = (
  over: object = {},
  props: Partial<React.ComponentProps<typeof SystemSummaryCard>> = {}
) =>
  renderComponent(
    <SystemSummaryCard
      system={system(over)}
      access={true}
      checkingAccess={false}
      {...props}
    />
  );

beforeEach(() => {
  jest.clearAllMocks();
  (useTapisConfig as jest.Mock).mockReturnValue({
    username: 'cgarcia',
    claims: { 'tapis/username': 'cgarcia' },
  });
  (SystemsHooks.useCreateCredential as jest.Mock).mockReturnValue({
    create: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    invalidate: jest.fn(),
  });
  (SystemsHooks.useCheckCredential as jest.Mock).mockReturnValue({
    isFetching: false,
    isSuccess: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
    remove: jest.fn(),
  });
  (SystemsHooks.useGetCredential as jest.Mock).mockReturnValue({
    isFetching: false,
    isSuccess: false,
    isError: false,
    error: null,
    refetch: jest.fn().mockResolvedValue({ error: null, data: undefined }),
    remove: jest.fn(),
  });
  (SystemsHooks.useHostEval as jest.Mock).mockReturnValue({
    isFetching: false,
    isError: false,
    error: null,
    data: undefined,
    refetch: jest.fn(),
  });
  (SystemsHooks.usePatch as jest.Mock).mockReturnValue({
    patch: jest.fn(),
    isLoading: false,
    isSuccess: false,
    error: null,
    reset: jest.fn(),
    invalidate: jest.fn(),
  });
  (SystemsHooks.useRemoveCredential as jest.Mock).mockReturnValue({
    remove: jest.fn(),
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: jest.fn(),
  });
  // the children line, the history box, the profile popover, the unlink
  // door — all mounted by the card, quiet until asked
  (SystemsHooks.useList as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  });
  (SystemsHooks.useSystemHistory as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
  });
  (SystemsHooks.useSchedulerProfiles as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    error: null,
  });
  (SystemsHooks.useUnlinkFromParent as jest.Mock).mockReturnValue({
    unlink: jest.fn(),
    isLoading: false,
    isSuccess: false,
    error: null,
    invalidate: jest.fn(),
    reset: jest.fn(),
  });
  // the Sharing & access panel's five doors
  (SystemsHooks.useUserPermsMap as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  });
  const mutation = () => ({
    isLoading: false,
    isSuccess: false,
    isError: false,
    error: null,
    reset: jest.fn(),
    invalidate: jest.fn(),
  });
  (SystemsHooks.useShareSystem as jest.Mock).mockReturnValue({
    ...mutation(),
    share: jest.fn(),
  });
  (SystemsHooks.useUnShareSystem as jest.Mock).mockReturnValue({
    ...mutation(),
    unShare: jest.fn(),
  });
  (SystemsHooks.useGrantUserPerms as jest.Mock).mockReturnValue({
    ...mutation(),
    grant: jest.fn(),
  });
  (SystemsHooks.useRevokeUserPerms as jest.Mock).mockReturnValue({
    ...mutation(),
    revoke: jest.fn(),
  });
  // the Lifecycle box's four acts
  (SystemsHooks.useEnableSystem as jest.Mock).mockReturnValue({
    ...mutation(),
    enable: jest.fn(),
  });
  (SystemsHooks.useDisableSystem as jest.Mock).mockReturnValue({
    ...mutation(),
    disable: jest.fn(),
  });
  (SystemsHooks.useDeleteSystem as jest.Mock).mockReturnValue({
    ...mutation(),
    deleteSystem: jest.fn(),
  });
  (SystemsHooks.useUndeleteSystem as jest.Mock).mockReturnValue({
    ...mutation(),
    undeleteSystem: jest.fn(),
  });
});

describe('SystemSummaryCard', () => {
  it('says the system whole: host, queues with their default, tags', () => {
    renderCard();
    expect(screen.getByText('frontera')).toBeInTheDocument();
    expect(screen.getByText('frontera.tacc.utexas.edu:22')).toBeInTheDocument();
    expect(screen.getByText('/home1')).toBeInTheDocument();
    expect(screen.getByText('SLURM')).toBeInTheDocument();
    // both queues, and the default wears the star's tooltip structure
    expect(screen.getByText('normal')).toBeInTheDocument();
    expect(screen.getByText('development')).toBeInTheDocument();
    expect(screen.getByText('→ dev-q')).toBeInTheDocument();
    expect(screen.getByText('hpc')).toBeInTheDocument();
    expect(screen.getByText('FOO=bar')).toBeInTheDocument();
    // the owner is NOT a chip beside the title — Sharing & access answers
    // "whose is this", and the head line said it a second, worse time
    expect(screen.queryByText('owner cgarcia')).toBeNull();
    // the uuid moved off the title line and became copyable
    expect(screen.getByText('abc-123')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy System UUID' })
    ).toBeInTheDocument();
    // with access: no warning, files door open, and both credential
    // answers on the card — the passive one said, the real dial offered
    expect(screen.queryByText('Unauthenticated')).toBeNull();
    expect(
      screen.getByRole('button', { name: /Browse files/ })
    ).not.toBeDisabled();
    // access names who it worked as — the resolved host account, chipped
    expect(screen.getByText('listing works as')).toBeInTheDocument();
    expect(screen.getByText('not checked')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'check' })).toBeInTheDocument();
  });

  it('the door box says what the host wants, why it refused, and how in', () => {
    const onRecheck = jest.fn();
    renderCard(
      {},
      {
        access: false,
        accessError: new Error('FILES_CLIENT_SSH_AUTH credentials invalid'),
        onRecheck,
      }
    );
    expect(screen.getByText('No way in yet')).toBeInTheDocument();
    // method-aware ask, host named in place
    expect(screen.getByText(/needs an SSH key pair/)).toBeInTheDocument();
    // the probe's actual refusal, not a guess
    expect(
      screen.getByText(/what the last try came back with/)
    ).toBeInTheDocument();
    expect(screen.getByText(/credentials invalid/)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Authenticate/ })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Browse files/ })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: /re-check/ }));
    expect(onRecheck).toHaveBeenCalled();
  });

  it('reads no-credential as a to-do, not an alarm — and admits host state is unknown', () => {
    (SystemsHooks.useGetCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: true,
      error: new Error('SYSAPI_CRED_NOT_FOUND'),
      refetch: jest.fn().mockResolvedValue({}),
      remove: jest.fn(),
    });
    renderCard(
      {},
      {
        access: false,
        accessError: new Error('FILES_CLIENT_SSH_AUTH no credentials'),
        onRecheck: jest.fn(),
      }
    );
    expect(
      screen.getByText('no credential yet, host state unknown')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/no way to even ask whether the host is up/)
    ).toBeInTheDocument();
  });

  it('saves the red for a refusal DESPITE a stored credential', () => {
    (SystemsHooks.useGetCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: true,
      isError: false,
      error: null,
      data: { result: {} },
      refetch: jest.fn().mockResolvedValue({}),
      remove: jest.fn(),
    });
    renderCard(
      {},
      {
        access: false,
        accessError: new Error('FILES_CLIENT_SSH_AUTH permission denied'),
        onRecheck: jest.fn(),
      }
    );
    expect(
      screen.getByText('refused despite a stored credential')
    ).toBeInTheDocument();
    // the door points at the dial instead of asking for new credentials
    expect(
      screen.getByText(/a failed dial means the machine/)
    ).toBeInTheDocument();
  });

  it('blames the machine, not your credentials, when the host is down', () => {
    renderCard(
      {},
      {
        access: false,
        accessError: new Error('SSH connection error: connection timed out'),
        onRecheck: jest.fn(),
      }
    );
    // the fact goes amber and says what it actually knows
    expect(
      screen.getByText(/host not answering, likely down/)
    ).toBeInTheDocument();
    // and the door stops pitching credentials at a dead machine — the two
    // reassurances stand as their own lines now
    expect(screen.getByText('No answer from the host')).toBeInTheDocument();
    expect(screen.getByText(/Not a credentials problem/)).toBeInTheDocument();
    expect(
      screen.getByText(/Access resumes when it wakes/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/needs an SSH key pair/)).toBeNull();
  });

  it('holds the door box through a re-check instead of blinking away', () => {
    renderCard(
      {},
      {
        access: false,
        rechecking: true,
        accessError: new Error('still refused'),
        onRecheck: jest.fn(),
      }
    );
    expect(screen.getByText('No way in yet')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /trying/ })).toBeDisabled();
  });

  it('shows a deleted system read-only: banner, restore, no doors, no probing', () => {
    renderCard(
      {},
      {
        deleted: true,
        access: false,
        accessError: new Error('should never be shown'),
      }
    );
    // the banner and its restore press lead
    expect(screen.getByText('This system is deleted')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Restore/ })).toBeInTheDocument();
    // the facts still say the system whole — that is the point of the page
    expect(screen.getByText('frontera.tacc.utexas.edu:22')).toBeInTheDocument();
    // but nobody knocks: no credentials door, no manufactured refusal
    expect(screen.queryByText('No way in yet')).toBeNull();
    expect(screen.queryByText(/what the last try came back with/)).toBeNull();
    expect(
      screen.getByText('not asked, the system is deleted')
    ).toBeInTheDocument();
    // and no door to the Files page — it cannot see a deleted system
    expect(screen.queryByLabelText(/in Files/)).toBeNull();
    // the gear offers exactly one thing: the way back — no disable, no
    // share, nothing the service would just refuse
    fireEvent.click(screen.getByLabelText('System settings'));
    expect(screen.getByText('Restore system')).toBeInTheDocument();
    expect(screen.queryByText('Update system')).toBeNull();
    expect(screen.queryByText('Disable')).toBeNull();
    expect(screen.queryByText('Share')).toBeNull();
    expect(
      screen.getByText(/every setting waits until it is restored/)
    ).toBeInTheDocument();
  });

  it('warns on a disabled system and keeps the gear reachable', () => {
    renderCard({ enabled: false });
    expect(screen.getByText('System disabled')).toBeInTheDocument();
    expect(screen.getByLabelText('System settings')).toBeInTheDocument();
  });

  it('offers TMS keys as the one-press way in when that is the method', () => {
    renderCard({ defaultAuthnMethod: 'TMS_KEYS' }, { access: false });
    expect(
      screen.getByRole('button', { name: /Authenticate with TMS keys/ })
    ).toBeInTheDocument();
  });

  it('says a TMS outage as an outage, not as a user problem', () => {
    (SystemsHooks.useCreateCredential as jest.Mock).mockReturnValue({
      create: jest.fn(),
      isLoading: false,
      isSuccess: false,
      isError: true,
      error: new Error(
        'SYSLIB_CRED_TMS_KEYS_ERR Error calling TMS server. jwtTenant: tacc ' +
          'System: vista-tapis TargetUser: cgarcia TMS server URL: ' +
          'https://tms-server-dev.tacc.utexas.edu:3000 Error: Failed to ' +
          'connect to tms-server-dev.tacc.utexas.edu/129.114.35.127:3000'
      ),
      invalidate: jest.fn(),
    });
    renderCard({ defaultAuthnMethod: 'TMS_KEYS' }, { access: false });
    expect(
      screen.getByText(/TMS service itself is not answering/)
    ).toBeInTheDocument();
    expect(screen.getByText(/down for everyone/)).toBeInTheDocument();
    // the press survives an outage — try again later means try again
    expect(
      screen.getByRole('button', { name: /Authenticate with TMS keys/ })
    ).toBeInTheDocument();
  });

  it('tells no-credential apart from a credential that cannot connect', () => {
    (SystemsHooks.useCheckCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: true,
      error: new Error('SYSAPI_CRED_NOT_FOUND: Credential not found for user'),
      refetch: jest.fn(),
    });
    renderCard();
    // with access up, no-credential is said as the benign fact it is
    expect(
      screen.getByText(/none registered · access rides a share/)
    ).toBeInTheDocument();

    (SystemsHooks.useCheckCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: true,
      error: new Error('SSH_CONNECT_FAILURE: connection timed out'),
      refetch: jest.fn(),
    });
    renderCard();
    expect(
      screen.getByText('found, but the connection failed')
    ).toBeInTheDocument();
  });

  it('the remove press opens the modal that says whose credential it likely is', () => {
    const remove = jest.fn();
    (SystemsHooks.useHostEval as jest.Mock).mockReturnValue({
      isFetching: false,
      isError: false,
      error: null,
      data: undefined,
      refetch: jest.fn(),
    });
    (SystemsHooks.usePatch as jest.Mock).mockReturnValue({
      patch: jest.fn(),
      isLoading: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
      invalidate: jest.fn(),
    });
    (SystemsHooks.useRemoveCredential as jest.Mock).mockReturnValue({
      remove,
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    });
    // static shared account on a system someone else owns — the exact case
    // where removal would cut off everyone and is probably not yours to do
    renderCard({ owner: 'pi-owner', effectiveUserId: 'cg-host' });
    fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    expect(
      screen.getByText(/probably not yours to remove/)
    ).toBeInTheDocument();
    // multiple pi-owner mentions exist (the card's owner chip, the access
    // panel's caption) — the one that matters is the modal naming who
    // registered it
    expect(
      screen.getByText(/registered by the owner \(pi-owner\)/)
    ).toBeInTheDocument();
    // the press still exists — the service is the authority — and aims at
    // the HOST account, which the old default-username removal missed
    fireEvent.click(screen.getByRole('button', { name: /Remove credential/ }));
    expect(remove).toHaveBeenCalledWith(
      { systemId: 'frontera', userName: 'cg-host' },
      expect.anything()
    );
  });

  it('cancelling the modal removes nothing', () => {
    const remove = jest.fn();
    (SystemsHooks.useHostEval as jest.Mock).mockReturnValue({
      isFetching: false,
      isError: false,
      error: null,
      data: undefined,
      refetch: jest.fn(),
    });
    (SystemsHooks.usePatch as jest.Mock).mockReturnValue({
      patch: jest.fn(),
      isLoading: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
      invalidate: jest.fn(),
    });
    (SystemsHooks.useRemoveCredential as jest.Mock).mockReturnValue({
      remove,
      isLoading: false,
      isSuccess: false,
      isError: false,
      error: null,
      reset: jest.fn(),
    });
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'remove' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(remove).not.toHaveBeenCalled();
  });

  it('does not offer a check it knows will be refused — shared account, not yours', () => {
    renderCard({ owner: 'pi-owner', effectiveUserId: 'harvest' });
    expect(screen.queryByRole('button', { name: 'check' })).toBeNull();
    expect(screen.getByText('owner-only')).toBeInTheDocument();
    // remove stays offered — the modal carries the not-yours warning
    expect(screen.getByRole('button', { name: 'remove' })).toBeInTheDocument();
  });

  it('reads a SYSLIB_UNAUTH answer as "won\'t say", never as broken', () => {
    (SystemsHooks.useCheckCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: true,
      error: new Error('SYSLIB_UNAUTH Permission denied. Operation: checkCred'),
      refetch: jest.fn(),
      remove: jest.fn(),
    });
    renderCard();
    expect(screen.getByText('not permitted to check')).toBeInTheDocument();
    expect(screen.queryByText(/connection failed/)).toBeNull();
  });

  it('resolves a HOST_EVAL workdir on the press, then wears it as a directory', () => {
    const refetch = jest.fn();
    (SystemsHooks.useHostEval as jest.Mock).mockReturnValue({
      isFetching: false,
      isError: false,
      error: null,
      data: undefined,
      refetch,
    });
    renderCard();
    // fixture workdir is HOST_EVAL($SCRATCH): raw text shown, resolve offered
    expect(screen.getByText('HOST_EVAL($SCRATCH)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'resolve' }));
    expect(refetch).toHaveBeenCalled();
    // and the hook mounted disabled, asking for the right variable
    expect(
      (SystemsHooks.useHostEval as jest.Mock).mock.calls[0][0]
    ).toMatchObject({ envVarName: 'SCRATCH' });
    expect(
      (SystemsHooks.useHostEval as jest.Mock).mock.calls[0][1]
    ).toMatchObject({ enabled: false });

    // once the host answers, the real path appears as a directory row
    (SystemsHooks.useHostEval as jest.Mock).mockReturnValue({
      isFetching: false,
      isError: false,
      error: null,
      data: { result: { name: '/scratch/07960/cgarcia' } },
      refetch,
    });
    renderCard();
    expect(screen.getByText('/scratch/07960/cgarcia')).toBeInTheDocument();
    expect(
      screen.getByLabelText('Copy evaluated working directory')
    ).toBeInTheDocument();
  });

  it('stops the evaluated dir at the per-job boundary', () => {
    // ${JobUUID} does not exist until a run does — the browsable row must
    // end at the real parent, with the per-job tail said as such
    (SystemsHooks.useHostEval as jest.Mock).mockReturnValue({
      isFetching: false,
      isError: false,
      error: null,
      data: { result: { name: '/scratch/02222/user22' } },
      refetch: jest.fn(),
    });
    renderCard({
      jobWorkingDir: 'HOST_EVAL($SCRATCH)/tapis/${JobUUID}',
    });
    expect(screen.getByText('/scratch/02222/user22/tapis')).toBeInTheDocument();
    expect(screen.getByText('/${JobUUID}')).toBeInTheDocument();
    // copy targets the real directory, not the templated string
    expect(
      screen.getByLabelText('Copy evaluated working directory')
    ).toBeInTheDocument();
  });

  it('checks in two real steps: registry first, the dial only if stored', async () => {
    const lookupRefetch = jest
      .fn()
      .mockResolvedValue({ error: null, data: { result: {} } });
    const dialRefetch = jest.fn();
    (SystemsHooks.useGetCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: false,
      error: null,
      refetch: lookupRefetch,
      remove: jest.fn(),
    });
    (SystemsHooks.useCheckCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: false,
      error: null,
      refetch: dialRefetch,
      remove: jest.fn(),
    });
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'check' }));
    await waitFor(() => expect(dialRefetch).toHaveBeenCalled());
    expect(lookupRefetch).toHaveBeenCalled();
    // both credential hooks mount disabled again — the chip reads the
    // record's own hasCredentials, so mounting asks nothing
    expect(
      (SystemsHooks.useGetCredential as jest.Mock).mock.calls[0][1]
    ).toMatchObject({ enabled: false });
    expect(
      (SystemsHooks.useCheckCredential as jest.Mock).mock.calls[0][1]
    ).toMatchObject({ enabled: false });
  });

  it('the limits press opens every queue whole, and the profile shows', () => {
    renderCard({
      batchSchedulerProfile: 'tacc-apptainer',
      batchLogicalQueues: [
        {
          name: 'gpu-a100',
          hpcQueueName: 'gpu-a100',
          maxJobs: -1,
          maxJobsPerUser: 40,
          minNodeCount: 1,
          maxNodeCount: 16,
          minCoresPerNode: 1,
          maxCoresPerNode: 128,
          minMemoryMB: 1,
          maxMemoryMB: 256000,
          minMinutes: 1,
          maxMinutes: 2880,
        },
      ],
    });
    expect(screen.getByText('tacc-apptainer')).toBeInTheDocument();
    // identical hpc name is not echoed
    expect(screen.queryByText('→ gpu-a100')).toBeNull();
    // collapsed: no numbers yet
    expect(screen.queryByText(/jobs\s*\/user/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'limits' }));
    // the mini-table: earned headers only (every maxJobs is -1), cells
    // aligned per column; compound headers stack at the slash
    ['nodes', 'mem', 'time'].forEach((head) =>
      expect(screen.getByText(head)).toBeInTheDocument()
    );
    expect(screen.getByText(/cores\s*\/node/)).toBeInTheDocument();
    expect(screen.getByText(/jobs\s*\/user/)).toBeInTheDocument();
    expect(screen.queryByText('jobs')).toBeNull();
    expect(screen.getByText('≤16')).toBeInTheDocument();
    expect(screen.getByText('≤128')).toBeInTheDocument();
    expect(screen.getByText('≤250GB')).toBeInTheDocument();
    expect(screen.getByText('≤48h')).toBeInTheDocument();
    expect(screen.getByText('≤40')).toBeInTheDocument();
    // and back
    fireEvent.click(screen.getByRole('button', { name: 'less' }));
    expect(screen.queryByText(/jobs\s*\/user/)).toBeNull();
  });

  it('the record fields the card used to hide: mpi, prefix, caps, dtn, clock', () => {
    renderCard({
      mpiCmd: 'ibrun',
      enableCmdPrefix: true,
      jobCapabilities: [
        {
          category: 'HARDWARE',
          name: 'gpu',
          datatype: 'STRING',
          value: 'a100',
        },
      ],
      dtnSystemId: 'frontera-dtn',
      created: '2024-03-12T10:00:00Z',
      updated: '2026-09-04T08:00:00Z',
    });
    expect(screen.getByText('ibrun')).toBeInTheDocument();
    expect(screen.getByText(/jobs may prepend/)).toBeInTheDocument();
    expect(screen.getByText('gpu=a100')).toBeInTheDocument();
    expect(screen.getByText('frontera-dtn')).toBeInTheDocument();
    expect(screen.getByText(/stages data via/)).toBeInTheDocument();
    // the clock reads as an age now, on the identity line beside the uuid;
    // the exact stamp is the hover, as it was
    expect(screen.getByText(/· created/)).toBeInTheDocument();
    expect(screen.getByText(/· updated/)).toBeInTheDocument();
  });

  it('a parenting system names its children, with links', () => {
    (SystemsHooks.useList as jest.Mock).mockReturnValue({
      data: { result: [{ id: 'kid-a' }, { id: 'kid-b' }] },
      isLoading: false,
      error: null,
    });
    renderCard({ allowChildren: true });
    expect(screen.getByText(/parent of/)).toBeInTheDocument();
    expect(screen.getByText('kid-a')).toBeInTheDocument();
    expect(screen.getByText('kid-b')).toBeInTheDocument();
  });

  it('history loads on the press, newest first, actors named', () => {
    (SystemsHooks.useSystemHistory as jest.Mock).mockReturnValue({
      data: {
        result: [
          {
            operation: 'created',
            jwtUser: 'cgarcia',
            oboUser: 'cgarcia',
            created: '2024-03-12T10:00:00Z',
          },
          {
            operation: 'modified',
            jwtUser: 'files',
            oboUser: 'pi-owner',
            created: '2026-09-04T08:00:00Z',
            description: '{"enabled": true}',
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    });
    renderCard();
    // shut: the caption, not the rows
    expect(
      screen.getByText(/Log of changes to this system/)
    ).toBeInTheDocument();
    expect(screen.queryByText('created')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'load' }));
    expect(screen.getByText('created')).toBeInTheDocument();
    expect(screen.getByText('modified')).toBeInTheDocument();
    // the on-behalf-of user shows only when it differs
    expect(screen.getByText('by files for pi-owner')).toBeInTheDocument();
    expect(screen.getByText('by cgarcia')).toBeInTheDocument();
  });

  it('the profile chip opens to what the profile actually does', () => {
    (SystemsHooks.useSchedulerProfiles as jest.Mock).mockReturnValue({
      data: {
        result: [
          {
            name: 'tacc-apptainer',
            description: 'Loads the apptainer module',
            owner: 'admin',
            moduleLoads: [
              {
                moduleLoadCommand: 'module load',
                modulesToLoad: ['tacc-apptainer'],
              },
            ],
            hiddenOptions: ['MEM'],
          },
        ],
      },
      isLoading: false,
      isFetching: false,
      isError: false,
      error: null,
    });
    renderCard({ batchSchedulerProfile: 'tacc-apptainer' });
    fireEvent.click(screen.getByText('tacc-apptainer'));
    expect(screen.getByText(/runs before each job/)).toBeInTheDocument();
    expect(screen.getByText(/module load tacc-apptainer/)).toBeInTheDocument();
    expect(screen.getByText('MEM')).toBeInTheDocument();
    expect(screen.getByText(/Loads the apptainer module/)).toBeInTheDocument();
  });

  it('the gear unlinks a child for real now, behind its confirm', () => {
    const unlink = jest.fn();
    (SystemsHooks.useUnlinkFromParent as jest.Mock).mockReturnValue({
      unlink,
      isLoading: false,
      isSuccess: false,
      error: null,
      invalidate: jest.fn(),
      reset: jest.fn(),
    });
    renderCard({ parentId: 'mother-ship' });
    fireEvent.click(screen.getByLabelText('System settings'));
    fireEvent.click(screen.getByText('Unlink from parent'));
    // the dialog says what it costs, then the press acts
    expect(screen.getByText(/no relink door/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Unlink' }));
    expect(unlink).toHaveBeenCalledWith(
      { childSystemId: 'frontera' },
      expect.anything()
    );
  });

  it('allow child systems is a live flip, not a stub', () => {
    const patch = jest.fn();
    (SystemsHooks.usePatch as jest.Mock).mockReturnValue({
      patch,
      isLoading: false,
      isSuccess: false,
      error: null,
      reset: jest.fn(),
      invalidate: jest.fn(),
    });
    renderCard();
    fireEvent.click(screen.getByLabelText('System settings'));
    fireEvent.click(screen.getByText('Allow child systems'));
    expect(patch).toHaveBeenCalledWith(
      { systemId: 'frontera', reqPatchSystem: { allowChildren: true } },
      expect.anything()
    );
  });

  it('the hasCredentials chip answers from the record, both ways', () => {
    // the service computes hasCredentials on every get — no extra call
    renderCard({ hasCredentials: true });
    expect(screen.getByText('hasCredentials: true')).toBeInTheDocument();
  });

  it('…and says false when none is stored', () => {
    renderCard({ hasCredentials: false });
    expect(screen.getByText('hasCredentials: false')).toBeInTheDocument();
  });

  it('a re-check holds the standing verdict — nothing pops out', () => {
    renderCard(
      {},
      {
        access: false,
        rechecking: true,
        accessError: new Error('FILES_CLIENT_SSH_AUTH credentials invalid'),
        onRecheck: jest.fn(),
      }
    );
    // the door box stands and the access verdict keeps its words; the
    // only movement is the re-check press narrating itself
    expect(screen.getByText('No way in yet')).toBeInTheDocument();
    expect(screen.queryByText('trying a listing…')).toBeNull();
    expect(screen.getByText('trying…')).toBeInTheDocument();
  });

  it('falls through to the dial when the LOOKUP is what got refused', async () => {
    // reading credentials is often more locked-down than dialing them —
    // an owner denied the lookup must still get their dial
    const lookupRefetch = jest.fn().mockResolvedValue({
      error: new Error('SYSLIB_UNAUTH Permission denied. Operation: getCred'),
      data: undefined,
    });
    const dialRefetch = jest.fn();
    (SystemsHooks.useGetCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: false,
      error: null,
      refetch: lookupRefetch,
      remove: jest.fn(),
    });
    (SystemsHooks.useCheckCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: false,
      error: null,
      refetch: dialRefetch,
      remove: jest.fn(),
    });
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'check' }));
    await waitFor(() => expect(dialRefetch).toHaveBeenCalled());
  });

  it('spends nothing on the dial when the registry already said no', async () => {
    const lookupRefetch = jest.fn().mockResolvedValue({
      error: new Error('CRED_NOT_FOUND'),
      data: undefined,
    });
    const dialRefetch = jest.fn();
    (SystemsHooks.useGetCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: false,
      error: null,
      refetch: lookupRefetch,
      remove: jest.fn(),
    });
    (SystemsHooks.useCheckCredential as jest.Mock).mockReturnValue({
      isFetching: false,
      isSuccess: false,
      isError: false,
      error: null,
      refetch: dialRefetch,
      remove: jest.fn(),
    });
    renderCard();
    fireEvent.click(screen.getByRole('button', { name: 'check' }));
    await waitFor(() => expect(lookupRefetch).toHaveBeenCalled());
    expect(dialRefetch).not.toHaveBeenCalled();
  });
});

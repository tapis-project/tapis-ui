import React from 'react';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import SessionCard from '../SessionCard';

jest.mock('@tapis/tapisui-hooks');

// the real QueryClientProvider stays (TapisProvider mounts it); only the
// client handle is ours, so the session-found invalidation is observable
const invalidateQueries = jest.fn();
jest.mock('react-query', () => ({
  ...(jest.requireActual('react-query') as object),
  useQueryClient: () => ({ invalidateQueries }),
}));

const mockOutput = (text?: string) =>
  (Hooks.useGetJobOutputText as jest.Mock).mockImplementation(
    (_params, options) => {
      if (text !== undefined && options?.enabled && options?.onSuccess) {
        options.onSuccess(text);
      }
      return {
        data: text,
        error: null,
        isFetching: false,
        isSuccess: text !== undefined,
        isError: false,
      };
    }
  );

const job = (over: any = {}) =>
  ({
    uuid: 'u-1',
    name: 'flexserv-run',
    appId: 'flexserv',
    status: 'RUNNING',
    execSystemId: 'frontera',
    ...over,
  } as any);

const READY =
  '-- FlexServ address: https://vista.tacc.utexas.edu:60091  FlexServ token: ddd';

beforeEach(() => jest.clearAllMocks());

describe('a session whose wall clock is up', () => {
  // the scheduler pulls the node at maxMinutes and the job only reads as
  // over once Tapis notices — for a minute or so the card would otherwise
  // still be offering an address that stopped answering
  const pastIts = (over: any = {}) =>
    job({
      maxMinutes: 60,
      remoteStarted: new Date(Date.now() - 61 * 60 * 1000).toISOString(),
      ...over,
    });

  it('warns that the address has probably already gone', () => {
    mockOutput(READY);
    renderComponent(<SessionCard job={pastIts()} />);
    expect(screen.getByText(/Past its 1h limit/)).toBeInTheDocument();
    // and still hands over the address — it is not certainly dead, and a
    // card that hides the way in is worse than one that qualifies it
    expect(
      screen.getByText('https://vista.tacc.utexas.edu:60091')
    ).toBeInTheDocument();
  });

  it('says nothing while the run is inside its allowance', () => {
    mockOutput(READY);
    renderComponent(
      <SessionCard
        job={pastIts({
          remoteStarted: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        })}
      />
    );
    expect(screen.queryByText(/limit/)).toBeNull();
  });
});

describe('SessionCard — the FlexServ entry', () => {
  it('stays out of the way of jobs that are not FlexServ', () => {
    mockOutput('');
    const { container } = renderComponent(
      <SessionCard job={job({ name: 'SleepSeconds', appId: 'SleepSeconds' })} />
    );
    expect(container).toBeEmptyDOMElement();
    // and it never asks for the file — neither the watch nor the look-back
    expect(
      (Hooks.useGetJobOutputText as jest.Mock).mock.calls.every(
        ([, options]) => options.enabled === false
      )
    ).toBe(true);
  });

  it('keeps a gravestone once the job is over — the address, never the token', () => {
    mockOutput(READY);
    renderComponent(<SessionCard job={job({ status: 'CANCELLED' })} />);
    expect(screen.getByText('FlexServ session')).toBeInTheDocument();
    expect(screen.getByText('· over')).toBeInTheDocument();
    expect(screen.getByText(/address and token are dead/)).toBeInTheDocument();
    expect(
      screen.getByText('https://vista.tacc.utexas.edu:60091')
    ).toBeInTheDocument();
    // the token has no afterlife: not shown, not copyable, not revealable
    expect(screen.queryByText('ddd')).toBeNull();
    expect(screen.queryByText('••••••••••')).toBeNull();
    expect(screen.queryByLabelText('Copy token')).toBeNull();
    expect(screen.queryByLabelText('Show token')).toBeNull();
    expect(screen.queryByRole('link', { name: /Open FlexServ/ })).toBeNull();
  });

  it('the gravestone folds too, and carries the docs', () => {
    mockOutput(READY);
    renderComponent(<SessionCard job={job({ status: 'CANCELLED' })} />);
    expect(
      screen.getByRole('button', { name: 'FlexServ docs' })
    ).toBeInTheDocument();
    const header = screen.getByRole('button', { name: /FlexServ session/ });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    // shut, the dead address rides the header line, struck through (the
    // collapse body lingers through its exit, so ≥1 like the live test)
    expect(
      screen.getAllByText('https://vista.tacc.utexas.edu:60091').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('keeps the gravestone even when the log has nothing left to say', () => {
    // the address line is the only part that depends on the log — once the
    // output dir archives, tapisjob.out 404s, and the box must still stand
    mockOutput('the run ended before any address was printed');
    renderComponent(<SessionCard job={job({ status: 'FINISHED' })} />);
    expect(screen.getByText('FlexServ session')).toBeInTheDocument();
    expect(screen.getByText('· over')).toBeInTheDocument();
    // no address survived, so the sentence claims nothing about one
    expect(
      screen.getByText(
        'Ended with the job. Run the app again for a new session.'
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('Was at')).toBeNull();
  });

  it('says what FlexServ is, and carries its docs', async () => {
    mockOutput(READY);
    renderComponent(<SessionCard job={job()} />);
    await screen.findByText('https://vista.tacc.utexas.edu:60091');
    expect(
      screen.getByText(/models, inference images, and more/)
    ).toBeInTheDocument();
    // the book glyph in the page-header grammar, pointed at the project site
    expect(
      screen.getByRole('button', { name: 'FlexServ docs' })
    ).toBeInTheDocument();
  });

  it("never shows one job's session on another job", async () => {
    mockOutput(READY);
    const { rerender } = renderComponent(<SessionCard job={job()} />);
    await screen.findByText('https://vista.tacc.utexas.edu:60091');
    // the page re-renders across /jobs/:uuid without remounting — the next
    // job arrives into the SAME card instance, its output still empty
    mockOutput('nothing announced yet');
    rerender(<SessionCard job={job({ uuid: 'u-2', status: 'BLOCKED' })} />);
    expect(
      screen.queryByText('https://vista.tacc.utexas.edu:60091')
    ).toBeNull();
    expect(screen.queryByLabelText('Copy token')).toBeNull();
    // and a held job is told the truth instead of "a few minutes"
    expect(screen.getByText(/held right now/)).toBeInTheDocument();
  });

  it('nudges the file listings awake the moment the server comes up', async () => {
    // the live transition: a genuinely waiting card, then the announcement
    // arrives on a later render of the SAME mounted card
    let liveText = 'nothing announced yet';
    (Hooks.useGetJobOutputText as jest.Mock).mockImplementation(() => ({
      data: liveText,
      error: null,
      isFetching: false,
      isSuccess: true,
      isError: false,
    }));
    renderComponent(<SessionCard job={job()} />);
    expect(invalidateQueries).not.toHaveBeenCalled();
    liveText = READY;
    // any state change re-renders the mounted card; the fold press is one
    const header = screen.getByRole('button', { name: /FlexServ session/ });
    fireEvent.click(header);
    fireEvent.click(header);
    await screen.findByText('https://vista.tacc.utexas.edu:60091');
    // the one live wire: new files exist now (the access file at least),
    // so listings on the exec system refetch once — no extra polling
    expect(invalidateQueries).toHaveBeenCalledWith(['files/list', 'frontera']);
  });

  it('a revisit paints the known session at once, and stays quiet', async () => {
    // the cache already holds the line (a prior visit found it): no waiting
    // copy, no listings nudge — the address is there in the first frame
    mockOutput(READY);
    renderComponent(<SessionCard job={job()} />);
    expect(
      screen.getByText('https://vista.tacc.utexas.edu:60091')
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Waiting for the server to announce itself/)
    ).toBeNull();
    expect(invalidateQueries).not.toHaveBeenCalled();
  });

  it('watches the dedicated access file first, the log as a slow fallback', async () => {
    (Hooks.useGetJobOutputText as jest.Mock).mockImplementation(
      (params, options) => {
        const isInfo = params.outputPath === 'flexserv_access_info.txt';
        if (isInfo && options?.enabled && options?.onSuccess) {
          options.onSuccess(READY);
        }
        return {
          data: isInfo ? READY : 'a log without the line',
          error: null,
          isFetching: false,
          isSuccess: true,
          isError: false,
        };
      }
    );
    renderComponent(<SessionCard job={job()} />);
    expect(
      await screen.findByText('https://vista.tacc.utexas.edu:60091')
    ).toBeInTheDocument();
    const calls = (Hooks.useGetJobOutputText as jest.Mock).mock.calls;
    const infoWatch = calls.find(
      ([params, options]) =>
        params.outputPath === 'flexserv_access_info.txt' &&
        params.allowIfRunning &&
        options.refetchInterval
    )!;
    const logWatch = calls.find(
      ([params, options]) =>
        params.outputPath === 'tapisjob.out' &&
        params.allowIfRunning &&
        options.refetchInterval
    )!;
    // the one-line file is the fast path; the whole log idles behind it
    expect(infoWatch[1].refetchInterval()).toBe(10_000);
    expect(logWatch[1].refetchInterval()).toBe(60_000);
  });

  it('the gravestone falls back to the log when the access file is gone', () => {
    (Hooks.useGetJobOutputText as jest.Mock).mockImplementation((params) =>
      params.outputPath === 'flexserv_access_info.txt'
        ? {
            data: undefined,
            error: new Error('404 not found'),
            isFetching: false,
            isSuccess: false,
            isError: true,
          }
        : {
            data: READY,
            error: null,
            isFetching: false,
            isSuccess: true,
            isError: false,
          }
    );
    renderComponent(<SessionCard job={job({ status: 'FINISHED' })} />);
    expect(
      screen.getByText('https://vista.tacc.utexas.edu:60091')
    ).toBeInTheDocument();
  });

  it('explains itself while it waits', () => {
    mockOutput('starting up');
    renderComponent(<SessionCard job={job()} />);
    expect(screen.getByText('FlexServ session')).toBeInTheDocument();
    expect(
      screen.getByText(/Waiting for the server to announce itself/)
    ).toBeInTheDocument();
  });

  it('hands over the address, and the token from behind the eye', async () => {
    mockOutput(READY);
    renderComponent(<SessionCard job={job()} />);

    expect(
      await screen.findByText('https://vista.tacc.utexas.edu:60091')
    ).toBeInTheDocument();
    // masked by default — the value is nowhere in the DOM until asked for
    expect(screen.queryByText('ddd')).toBeNull();
    expect(screen.getByText('••••••••••')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Show token'));
    expect(screen.getByText('ddd')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Hide token'));
    expect(screen.queryByText('ddd')).toBeNull();
    expect(screen.getByRole('link', { name: /Open FlexServ/ })).toHaveAttribute(
      'href',
      'https://vista.tacc.utexas.edu:60091'
    );
  });

  it('shuts like the Details box, the address staying on the header', async () => {
    mockOutput(READY);
    renderComponent(<SessionCard job={job()} />);
    await screen.findByText('https://vista.tacc.utexas.edu:60091');
    const header = screen.getByRole('button', { name: /FlexServ session/ });
    expect(header).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(header);
    expect(header).toHaveAttribute('aria-expanded', 'false');
    // shut, the one fact that matters rides the header line
    expect(
      screen.getAllByText('https://vista.tacc.utexas.edu:60091').length
    ).toBeGreaterThanOrEqual(1);
  });

  it('frames the session in a floating panel on the third press', async () => {
    mockOutput(READY);
    renderComponent(<SessionCard job={job()} />);
    fireEvent.click(await screen.findByRole('button', { name: /Panel/ }));
    // the window is up, pointed at the session, honest about framing
    const panel = within(
      screen.getByRole('dialog', { name: 'FlexServ session window' })
    );
    const frame = panel.getByTitle('FlexServ session') as HTMLIFrameElement;
    expect(frame.src).toBe('https://vista.tacc.utexas.edu:60091/');
    // the card's token copy and the panel's are siblings — scope to the panel
    expect(panel.getByLabelText('Copy token')).toBeInTheDocument();
    expect(panel.getByText(/refuses to be framed/)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText('Close session window'));
    expect(screen.queryByTitle('FlexServ session')).toBeNull();
  });

  it('offers to stop the job right where the session lives', async () => {
    const onStop = jest.fn();
    mockOutput(READY);
    renderComponent(<SessionCard job={job()} onStop={onStop} />);
    const stop = await screen.findByRole('button', {
      name: /Stop/,
    });
    fireEvent.click(stop);
    expect(onStop).toHaveBeenCalled();
    // the frees-the-node teaching moved off the row and into the hover
    fireEvent.mouseOver(stop);
    expect(await screen.findByText(/frees the node/)).toBeInTheDocument();
  });

  it('never offers to stop a job that is already over', () => {
    mockOutput(READY);
    renderComponent(
      <SessionCard job={job({ status: 'CANCELLED' })} onStop={jest.fn()} />
    );
    expect(screen.queryByRole('button', { name: /Stop/ })).toBeNull();
  });

  it('copies the real token even while it is hidden', async () => {
    const writeText = jest.fn();
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    mockOutput(READY);
    renderComponent(<SessionCard job={job()} />);
    fireEvent.click(await screen.findByLabelText('Copy token'));
    expect(writeText).toHaveBeenCalledWith('ddd');
  });

  it('stops asking the moment it has an answer', async () => {
    mockOutput(READY);
    renderComponent(<SessionCard job={job()} />);
    await screen.findByText('https://vista.tacc.utexas.edu:60091');

    await waitFor(() => {
      const calls = (Hooks.useGetJobOutputText as jest.Mock).mock.calls;
      expect(calls[calls.length - 1][1].enabled).toBe(false);
    });
  });

  it('backs off rather than hammering the file', () => {
    mockOutput('nothing yet');
    renderComponent(<SessionCard job={job()} />);
    // four calls per render now (two look-backs + two watchers); the
    // access-file watcher comes first among those with a schedule
    const [, { refetchInterval, refetchIntervalInBackground, retry }] = (
      Hooks.useGetJobOutputText as jest.Mock
    ).mock.calls.find(([, options]) => options.refetchInterval)!;
    // 10s at the start, and never in a hidden tab; a missing file is the
    // expected answer, so react-query's own retries stay out of it
    expect(refetchInterval()).toBe(10_000);
    expect(refetchIntervalInBackground).toBe(false);
    expect(retry).toBe(false);
  });
});

describe('SessionCard — the ParaView entry', () => {
  const pvJob = (over: any = {}) =>
    ({
      uuid: 'u-pv',
      name: 'paraview run',
      appId: 'paraview-vista',
      status: 'RUNNING',
      execSystemId: 'vista',
      ...over,
    } as any);

  // the line as the batch script's shell trace prints it
  const PV_LOG =
    '++ INTERACTIVE_SESSION_ADDRESS=https://vista.tacc.utexas.edu:60788';

  it('recognizes a ParaView job by its app id and wears its own title', () => {
    mockOutput(PV_LOG);
    renderComponent(<SessionCard job={pvJob()} />);
    expect(screen.getByText('ParaView session')).toBeInTheDocument();
    expect(
      screen.getByText('https://vista.tacc.utexas.edu:60788')
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Open ParaView/ })).toHaveAttribute(
      'href',
      'https://vista.tacc.utexas.edu:60788'
    );
  });

  it('has no token row — ParaView never announces one', () => {
    mockOutput(PV_LOG);
    renderComponent(<SessionCard job={pvJob()} />);
    expect(screen.queryByText('Token')).toBeNull();
    expect(screen.queryByLabelText('Copy token')).toBeNull();
  });

  it('tells a queued job the truth about the queue', () => {
    mockOutput('nothing yet');
    renderComponent(<SessionCard job={pvJob({ status: 'QUEUED' })} />);
    // subtle in the header, honest in the body: the queue can be long,
    // and "a few minutes in" is a promise only a running job can make
    expect(screen.getByText('· queued')).toBeInTheDocument();
    expect(
      screen.getByText(/Still in the scheduler's queue/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/usually appears a few minutes in/)).toBeNull();
  });

  it('says staging while Tapis still holds the job', () => {
    mockOutput('nothing yet');
    renderComponent(<SessionCard job={pvJob({ status: 'STAGING_INPUTS' })} />);
    expect(screen.getByText('· waiting')).toBeInTheDocument();
    expect(
      screen.getByText(/being staged and handed to the scheduler/)
    ).toBeInTheDocument();
  });

  it('never offers the panel — DCV refuses to be framed', () => {
    mockOutput(PV_LOG);
    renderComponent(<SessionCard job={pvJob()} />);
    // the tab button stands alone; a panel that can only show a blank
    // box is not offered at all
    expect(
      screen.getByRole('link', { name: /Open ParaView/ })
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Panel/ })).toBeNull();
  });

  it('watches only the log — there is no dedicated file to ask for', () => {
    mockOutput('nothing yet');
    renderComponent(<SessionCard job={pvJob()} />);
    const calls = (Hooks.useGetJobOutputText as jest.Mock).mock.calls;
    expect(
      calls.every(
        ([params, options]) =>
          params.outputPath === 'tapisjob.out' || options.enabled === false
      )
    ).toBe(true);
    // and the log takes the file's eager backoff, since it is the only source
    const scheduled = calls.find(([, options]) => options.refetchInterval);
    expect(scheduled?.[1].refetchInterval()).toBe(10_000);
  });

  it('waits without promising a token', () => {
    mockOutput('nothing yet');
    renderComponent(<SessionCard job={pvJob()} />);
    expect(
      screen.getByText(/the address usually appears a few minutes in/)
    ).toBeInTheDocument();
    expect(screen.queryByText(/and token/)).toBeNull();
  });

  it('keeps a gravestone that mourns the address alone', () => {
    mockOutput(PV_LOG);
    renderComponent(<SessionCard job={pvJob({ status: 'FINISHED' })} />);
    expect(screen.getByText('ParaView session')).toBeInTheDocument();
    expect(screen.getByText('· over')).toBeInTheDocument();
    expect(screen.getByText(/that address is dead/)).toBeInTheDocument();
    expect(screen.queryByText(/address and token/)).toBeNull();
  });
});

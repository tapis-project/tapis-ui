/**
 * The access verdict, across a system swap. Born of a real bug: going back
 * to a system already probed this session — a cache hit, answered
 * synchronously — showed the FULL "No way in yet" refusal for one frame
 * before collapsing into the file explorer, because the old code cleared
 * the verdict in a useEffect that only runs after the stale frame paints.
 *
 * SystemSummaryCard and SystemFilesPanel are stubbed to report exactly
 * the access props Layout computed for them — the logic under test lives
 * in Layout, not in how the card draws it.
 */
import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Systems as Hooks, Files as FilesHooks } from '@tapis/tapisui-hooks';
import { useSystemsSource } from 'app/Files/_components/systemsSource';
import store from 'redux/store';
import Layout from './Layout';

// NOTE: like testing/utils.tsx's renderComponent, TapisProvider is pulled
// via requireActual so jest.mock('@tapis/tapisui-hooks') below does not
// mock the provider along with the hooks.
const { TapisProvider } = jest.requireActual('@tapis/tapisui-hooks') as any;

// renderComponent() wraps providers around the element ONCE; RTL's
// rerender() then swaps in a whole NEW element, dropping them (Layout's
// useQueryClient() needs one on every render, including the second). The
// `wrapper` option is RTL's answer — it re-applies on every rerender.
const Providers: React.FC<React.PropsWithChildren<unknown>> = ({
  children,
}) => (
  <Provider store={store}>
    <TapisProvider basePath="tapis.test">
      <BrowserRouter>{children}</BrowserRouter>
    </TapisProvider>
  </Provider>
);
const renderLayout = (el: React.ReactElement) =>
  render(el, { wrapper: Providers });

jest.mock('@tapis/tapisui-hooks');
jest.mock('app/Files/_components/systemsSource', () => ({
  useSystemsSource: jest.fn(),
}));
jest.mock('app/_components/NavSpine', () => ({
  useSpineWriter: () => jest.fn(),
}));
jest.mock('app/_components/PageShell/RecordJson', () => () => null);
jest.mock('../SystemFilesPanel', () => ({ systemId }: { systemId: string }) => (
  <div data-testid="files-panel">{systemId}</div>
));
jest.mock(
  '../SystemSummaryCard',
  () =>
    ({
      system,
      access,
      checkingAccess,
      accessError,
    }: {
      system: { id: string };
      access: boolean;
      checkingAccess: boolean;
      accessError: Error | null;
    }) =>
      (
        <div data-testid="summary-card">
          <span data-testid="card-system">{system.id}</span>
          <span data-testid="card-access">{String(access)}</span>
          <span data-testid="card-checking">{String(checkingAccess)}</span>
          <span data-testid="card-error">{accessError?.message ?? ''}</span>
        </div>
      )
);

const system = (id: string) => ({ id, allowChildren: false });

const mockSource = (systems: Array<{ id: string }>) =>
  (useSystemsSource as jest.Mock).mockReturnValue({
    systems,
    isLoading: false,
    spine: undefined,
  });

const detailsFor = (id: string) =>
  (Hooks.useDetails as jest.Mock).mockImplementation(
    ({ systemId }: { systemId: string }) => ({
      data: systemId === id ? { result: system(id) } : undefined,
      isLoading: false,
      error: null,
    })
  );

beforeEach(() => {
  jest.clearAllMocks();
  (Hooks.useDeletedList as jest.Mock).mockReturnValue({
    data: { result: [] },
    isFetching: false,
  });
});

describe('a system already probed this session', () => {
  it('never renders the refusal against the freshly-selected system', () => {
    // system 'a': answered, refused. system 'b': answered, access GRANTED
    // and already cached — the case that used to flash 'a's refusal
    // against 'b' before correcting a frame later.
    //
    // The error and the refetch fn are hoisted OUTSIDE the mock
    // implementation, module-scoped: real react-query hands back the SAME
    // reference for an unchanged failed query across renders, and an
    // effect keyed on `probe.error` (Layout's second effect) spins forever
    // against a mock that manufactures a new Error() on every call.
    mockSource([system('a'), system('b')]);
    const refusedError = new Error('listing refused — cause unclear');
    const refetch = jest.fn();
    (FilesHooks.useList as jest.Mock).mockImplementation(
      ({ systemId }: { systemId: string }) =>
        systemId === 'a'
          ? {
              isFetching: false,
              isSuccess: false,
              isError: true,
              error: refusedError,
              refetch,
            }
          : {
              isFetching: false,
              isSuccess: true,
              isError: false,
              error: null,
              refetch,
            }
    );

    detailsFor('a');
    const { rerender } = renderLayout(<Layout systemId="a" />);
    expect(screen.getByTestId('card-access').textContent).toBe('false');
    expect(screen.getByTestId('card-error').textContent).toMatch(
      /listing refused/
    );

    // navigate to the already-cached, already-authenticated system
    detailsFor('b');
    rerender(<Layout systemId="b" />);

    // the committed DOM never shows 'a's refusal against 'b' — a thrown-
    // away render never reaches the screen, so this is the whole test
    expect(screen.getByTestId('card-system').textContent).toBe('b');
    expect(screen.getByTestId('card-access').textContent).toBe('true');
    expect(screen.getByTestId('card-error').textContent).toBe('');
    expect(screen.getByTestId('card-checking').textContent).toBe('false');
  });

  it('shows the honest checking state for a system with no cached answer yet', () => {
    // system 'c' has never been probed — the probe is genuinely in flight
    mockSource([system('a'), system('c')]);
    (FilesHooks.useList as jest.Mock).mockImplementation(
      ({ systemId }: { systemId: string }) =>
        systemId === 'a'
          ? {
              isFetching: false,
              isSuccess: true,
              isError: false,
              error: null,
              refetch: jest.fn(),
            }
          : {
              isFetching: true,
              isSuccess: false,
              isError: false,
              error: null,
              refetch: jest.fn(),
            }
    );

    detailsFor('a');
    const { rerender } = renderLayout(<Layout systemId="a" />);
    expect(screen.getByTestId('card-access').textContent).toBe('true');

    detailsFor('c');
    rerender(<Layout systemId="c" />);

    // not the stale 'true' from 'a', and not a refusal either — a plain
    // in-flight check, same as a first-ever visit
    expect(screen.getByTestId('card-access').textContent).toBe('false');
    expect(screen.getByTestId('card-checking').textContent).toBe('true');
    expect(screen.getByTestId('card-error').textContent).toBe('');
  });
});

describe('an unstable error reference', () => {
  it('does not spin the verdict effect into a render loop', () => {
    // The effect that latches the probe's answer used to be keyed on the
    // Error OBJECT. react-query keeps that reference stable for an
    // unchanged failed query, so it worked — but only by that grace. A
    // caller handing back a fresh Error per render (a wrapper that
    // re-boxes it, or a test double like this one) made it
    // setState → render → new object → setState, without end. Keying on
    // the message means a re-boxed identical error is a no-op.
    mockSource([system('a')]);
    (FilesHooks.useList as jest.Mock).mockImplementation(() => ({
      isFetching: false,
      isSuccess: false,
      isError: true,
      // a NEW Error every single render — the shape that used to loop
      error: new Error('listing refused — cause unclear'),
      refetch: jest.fn(),
    }));

    detailsFor('a');
    // if the effect still keyed on identity this would exhaust the render
    // budget and throw "Maximum update depth exceeded" instead of settling
    expect(() => renderLayout(<Layout systemId="a" />)).not.toThrow();
    expect(screen.getByTestId('card-error').textContent).toMatch(
      /listing refused/
    );
  });
});

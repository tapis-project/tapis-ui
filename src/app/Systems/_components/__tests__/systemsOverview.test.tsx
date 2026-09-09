import React from 'react';
import { screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import SystemsOverview from '../SystemsOverview';
import { resetNavEngine } from 'app/_components/NavSpine';

jest.mock('@tapis/tapisui-hooks');
// the create dialogs (guided panel / classic stepper behind the pref) have
// their own hook needs — the landing only has to own the button that opens
// the door
jest.mock('../SystemToolbar/NewSystemDialog', () => ({
  __esModule: true,
  default: () => null,
}));

const sys = (id: string, over: object = {}) => ({
  id,
  host: `${id}.tacc.utexas.edu`,
  systemType: 'LINUX',
  owner: 'cgarcia',
  enabled: true,
  isPublic: false,
  defaultAuthnMethod: 'PKI_KEYS',
  canExec: true,
  updated: '2026-09-01T00:00:00Z',
  ...over,
});

const fullPage = [
  sys('frontera', { isPublic: true }),
  sys('stampede2'),
  ...Array.from({ length: 48 }, (_, i) => sys(`sys-${i}`)),
];

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  resetNavEngine();
  (Hooks.useListWindow as jest.Mock).mockReturnValue({
    data: { pages: [{ items: fullPage, total: 312 }] },
    isLoading: false,
    error: null,
    hasNextPage: true,
    isFetchingNextPage: false,
    fetchNextPage: jest.fn(),
  });
  (Hooks.useList as jest.Mock).mockReturnValue({
    data: undefined,
    isLoading: false,
    error: null,
  });
  (Hooks.useDeletedList as jest.Mock).mockReturnValue({ data: { result: [] } });
});

describe('the /systems landing', () => {
  it('shows the window as a table, with the ledger honesty underneath', () => {
    renderComponent(<SystemsOverview />);
    expect(screen.getByText('frontera')).toBeInTheDocument();
    expect(screen.getByText('frontera.tacc.utexas.edu')).toBeInTheDocument();
    expect(
      screen.getByText(/Window: 50 of 312 systems\. The nav's \+50 loads more/)
    ).toBeInTheDocument();
    expect(screen.getByText('new system')).toBeInTheDocument();
  });

  it('first load is the page with skeleton rows, not a spinner', () => {
    (Hooks.useListWindow as jest.Mock).mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });
    renderComponent(<SystemsOverview />);
    expect(screen.getByText(/listing systems/)).toBeInTheDocument();
    expect(document.querySelector('[data-skeletonrow]')).not.toBeNull();
    expect(screen.queryByText(/No systems visible/)).toBeNull();
  });
});

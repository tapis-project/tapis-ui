import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import SystemsNavV2 from '../SystemsNav/SystemsNavV2';
import { resetNavEngine, setNavEngine } from 'app/_components/NavSpine';

jest.mock('@tapis/tapisui-hooks');

const sys = (id: string) => ({
  id,
  host: `${id}.tacc.utexas.edu`,
  systemType: 'LINUX',
  owner: 'cgarcia',
  enabled: true,
  isPublic: false,
  updated: '2026-09-01T00:00:00Z',
});

// a truncated window must be a FULL page — a short page means "server has
// no more" and completes the window, which is its own test below
const fullPage = [
  sys('stampede2'),
  sys('frontera'),
  ...Array.from({ length: 48 }, (_, i) => sys(`node-${i}`)),
];

const windowResult = (over: object = {}) => ({
  data: { pages: [{ items: fullPage, total: 312 }] },
  isLoading: false,
  error: null,
  hasNextPage: true,
  isFetchingNextPage: false,
  fetchNextPage: jest.fn(),
  ...over,
});

const mockEngines = (windowRes: any, classicRes?: any) => {
  (Hooks.useListWindow as jest.Mock).mockReturnValue(windowRes);
  (Hooks.useList as jest.Mock).mockReturnValue(
    classicRes ?? { data: undefined, isLoading: false, error: null }
  );
};

beforeEach(() => {
  jest.clearAllMocks();
  window.localStorage.clear();
  resetNavEngine();
});

describe('the systems nav on the spine', () => {
  it('rides the window by default, ledger on top', () => {
    mockEngines(windowResult());
    renderComponent(<SystemsNavV2 />);
    expect(screen.getByText('50 of 312 systems')).toBeInTheDocument();
    // the window caveat is the search box's now, not the ledger's
    expect(screen.queryByText(/only the 50 loaded/)).toBeNull();
    expect(screen.getByText('stampede2')).toBeInTheDocument();
    expect(screen.getByText('frontera')).toBeInTheDocument();
    // only the windowed engine ran
    expect((Hooks.useListWindow as jest.Mock).mock.calls[0][2].enabled).toBe(
      true
    );
    expect((Hooks.useList as jest.Mock).mock.calls[0][1].enabled).toBe(false);
  });

  it('the +50 press asks the window for its next page', () => {
    const w = windowResult();
    mockEngines(w);
    renderComponent(<SystemsNavV2 />);
    fireEvent.click(screen.getByText('+50'));
    expect(w.fetchNextPage).toHaveBeenCalled();
  });

  it('first load keeps the chrome — search, ledger, skeleton rows', () => {
    mockEngines(
      windowResult({ data: undefined, isLoading: true, hasNextPage: undefined })
    );
    renderComponent(<SystemsNavV2 />);
    expect(screen.getByLabelText('Search')).toBeInTheDocument();
    expect(screen.getByText('loading systems…')).toBeInTheDocument();
    expect(document.querySelector('[data-navskeleton]')).not.toBeNull();
  });

  it('a complete window retires the ledger warnings', () => {
    mockEngines(
      windowResult({
        data: { pages: [{ items: [sys('stampede2')], total: 1 }] },
        hasNextPage: false,
      })
    );
    renderComponent(<SystemsNavV2 />);
    expect(screen.getByText('1 system · loaded')).toBeInTheDocument();
    expect(screen.queryByText(/only the/)).toBeNull();
    expect(screen.queryByText('+50')).toBeNull();
  });

  it('classic mode is the old road, untouched and unbannered', () => {
    setNavEngine('classic');
    mockEngines(windowResult(), {
      data: { result: [sys('classic-sys')] },
      isLoading: false,
      error: null,
    });
    const { container } = renderComponent(<SystemsNavV2 />);
    expect(screen.getByText('classic-sys')).toBeInTheDocument();
    expect(container.querySelector('[data-navwindowbar]')).toBeNull();
    expect((Hooks.useList as jest.Mock).mock.calls[0][1].enabled).toBe(true);
    expect((Hooks.useListWindow as jest.Mock).mock.calls[0][2].enabled).toBe(
      false
    );
  });
});

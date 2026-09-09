import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import JobsNavV2 from '../JobsNav/JobsNavV2';
import { resetNavEngine, setNavEngine } from 'app/_components/NavSpine';

jest.mock('@tapis/tapisui-hooks');

const job = (i: number) => ({
  uuid: `uuid-${i}`,
  name: `run-${i}`,
  appId: 'flexserv',
  status: 'FINISHED',
  created: '2026-09-01T00:00:00Z',
});

const fullPage = Array.from({ length: 50 }, (_, i) => job(i));

const mock = (windowRes: any, classicRes?: any) => {
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

describe('the jobs nav on the spine', () => {
  it('windows by default, with the ledger and its expand', () => {
    const fetchNextPage = jest.fn();
    mock({
      data: { pages: [{ items: fullPage, total: 480 }] },
      isLoading: false,
      error: null,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage,
    });
    renderComponent(<JobsNavV2 />);
    expect(screen.getByText('50 of 480 jobs')).toBeInTheDocument();
    // the ledger no longer repeats the window caveat: that is the search
    // box's, said when you ask rather than announced at rest
    expect(screen.queryByText(/only the 50 loaded/)).toBeNull();
    fireEvent.click(screen.getByText('+50'));
    expect(fetchNextPage).toHaveBeenCalled();
  });

  it('says what the search covered, and what it cannot', () => {
    mock({
      data: { pages: [{ items: fullPage, total: 480 }] },
      isLoading: false,
      error: null,
      hasNextPage: true,
      isFetchingNextPage: false,
      fetchNextPage: jest.fn(),
    });
    renderComponent(<JobsNavV2 />);
    // nothing typed, nothing said
    expect(screen.queryByText(/Searching the 50/)).toBeNull();
    fireEvent.change(screen.getByLabelText('Search'), {
      target: { value: 'flexserv' },
    });
    expect(
      screen.getByText(/Searching the 50 loaded jobs/)
    ).toBeInTheDocument();
    // the part loading more does not fix
    expect(
      screen.getByText(/Hidden jobs are in no listing/)
    ).toBeInTheDocument();
  });

  it('classic mode keeps the 300-fetch and shows no ledger', () => {
    setNavEngine('classic');
    mock(
      {
        data: undefined,
        isLoading: false,
        error: null,
        hasNextPage: false,
        isFetchingNextPage: false,
        fetchNextPage: jest.fn(),
      },
      { data: { result: [job(1)] }, isLoading: false, error: null }
    );
    const { container } = renderComponent(<JobsNavV2 />);
    expect(screen.getByText(/run-1/)).toBeInTheDocument();
    expect(container.querySelector('[data-navwindowbar]')).toBeNull();
    expect((Hooks.useList as jest.Mock).mock.calls[0][1].enabled).toBe(true);
    expect((Hooks.useListWindow as jest.Mock).mock.calls[0][2].enabled).toBe(
      false
    );
  });
});

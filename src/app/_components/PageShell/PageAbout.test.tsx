import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import PageAbout from './PageAbout';
import { setInfoDetail } from './infoDetail';

const render = (title = 'Apps') =>
  renderComponent(
    <PageAbout
      title={title}
      stats={[
        { n: 47, label: 'apps' },
        { n: 12, label: 'public' },
        { n: 0, label: 'disabled', when: false },
      ]}
      actions={<button type="button">new app</button>}
      lead="An app is a runnable definition."
      points={['Select one to see its runs.', 'Launch turns it into a job.']}
    />
  );

beforeEach(() => {
  window.localStorage.clear();
  setInfoDetail(true);
});

describe('PageAbout', () => {
  it('shows the numbers and the page action beside them', () => {
    render();
    expect(screen.getByText('47')).toBeInTheDocument();
    expect(screen.getByText('apps')).toBeInTheDocument();
    expect(screen.getByText('new app')).toBeInTheDocument();
    // a stat with when:false is not a zero tile, it is no tile
    expect(screen.queryByText('disabled')).not.toBeInTheDocument();
  });

  it('gives each point its own line rather than one paragraph', () => {
    render();
    expect(screen.getAllByRole('listitem')).toHaveLength(2);
  });

  it('follows the header switch, for every page at once', async () => {
    const { unmount } = render();
    expect(screen.getByText('An app is a runnable definition.')).toBeVisible();

    act(() => setInfoDetail(false));
    await waitFor(() =>
      expect(
        screen.queryByText('An app is a runnable definition.')
      ).not.toBeInTheDocument()
    );
    // the numbers are the part you always want — they never go
    expect(screen.getByText('47')).toBeInTheDocument();

    // and it is one switch, not one per landing: a different page agrees
    unmount();
    render('Jobs');
    expect(
      screen.queryByText('An app is a runnable definition.')
    ).not.toBeInTheDocument();
  });

  it('remembers the switch across a remount', () => {
    setInfoDetail(false);
    render();
    expect(
      screen.queryByText('An app is a runnable definition.')
    ).not.toBeInTheDocument();
  });
});

describe('where the numbers sit', () => {
  const tileRow = (container: HTMLElement) =>
    container.firstElementChild?.lastElementChild as HTMLElement;

  it('separates the numbers from the words when the words are there', () => {
    setInfoDetail(true);
    const { container } = render();
    expect(tileRow(container)).toHaveStyle('margin-top: 8px');
  });

  it('closes the gap when there are no words above them', () => {
    // the gap was unconditional, so with descriptions off the numbers sat
    // eight pixels lower than the first row of every other page
    setInfoDetail(false);
    const { container } = render();
    expect(tileRow(container)).toHaveStyle('margin-top: 0px');
  });
});

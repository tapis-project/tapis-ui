import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { useLocation } from 'react-router-dom';
import PageHeaderTitle, {
  InfoDetailToggle,
  PageHeaderRow,
  PageWidthToggle,
} from './PageHeaderTitle';
import { getInfoDetail, setInfoDetail } from './infoDetail';
import {
  DEFAULT_BOUNDED_WIDTH,
  NAV_COLUMN_WIDTH,
  getBoundedWidth,
  getPageWide,
  setBoundedWidth,
  setPageWide,
} from './pageWidth';

beforeEach(() => {
  window.localStorage.clear();
  setInfoDetail(true);
  setPageWide(false);
  setBoundedWidth(DEFAULT_BOUNDED_WIDTH);
});

describe('PageHeaderTitle', () => {
  const Where: React.FC = () => <span>{`at ${useLocation().pathname}`}</span>;

  it('is a button back to the landing, not decoration', () => {
    renderComponent(
      <>
        <PageHeaderTitle to="/jobs">Jobs</PageHeaderTitle>
        <Where />
      </>
    );
    const title = screen.getByText('Jobs');
    // a real button, so it is reachable by keyboard and reads as pressable
    expect(title.tagName).toBe('BUTTON');
    expect(screen.queryByText('at /jobs')).not.toBeInTheDocument();

    fireEvent.click(title);
    expect(screen.getByText('at /jobs')).toBeInTheDocument();
  });
});

describe('InfoDetailToggle', () => {
  it('starts on — a page explains itself until told otherwise', () => {
    renderComponent(<InfoDetailToggle />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('flips the switch the whole app reads', () => {
    renderComponent(<InfoDetailToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(getInfoDetail()).toBe(false);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
    // and it is remembered, so it is a decision rather than a per-visit chore
    expect(window.localStorage.getItem('ui.infoDetail')).toBe('0');
  });
});

describe('PageWidthToggle', () => {
  it('starts bounded — dense tables read badly at ultrawide widths', () => {
    renderComponent(<PageWidthToggle />);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });

  it('opens the page to the window, and remembers', () => {
    renderComponent(<PageWidthToggle />);
    fireEvent.click(screen.getByRole('button'));
    expect(getPageWide()).toBe(true);
    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
    expect(window.localStorage.getItem('ui.pageWide')).toBe('1');
  });
});

describe('bounded width', () => {
  it('defaults to a column that suits a common monitor, not the widest', () => {
    expect(getBoundedWidth()).toBe(960);
  });

  it('takes a new width and remembers it', () => {
    setBoundedWidth(1440);
    expect(getBoundedWidth()).toBe(1440);
    expect(window.localStorage.getItem('ui.pageBoundedWidth')).toBe('1440');
  });

  it('refuses a width that would make the pane unusable', () => {
    setBoundedWidth(120);
    expect(getBoundedWidth()).toBe(DEFAULT_BOUNDED_WIDTH);
    setBoundedWidth(Number.NaN);
    expect(getBoundedWidth()).toBe(DEFAULT_BOUNDED_WIDTH);
  });
});

describe('PageHeaderRow', () => {
  it('stops where the content stops, allowing for the nav beside it', () => {
    const { container } = renderComponent(
      <PageHeaderRow>
        <span>left</span>
      </PageHeaderRow>
    );
    const row = container.firstElementChild as HTMLElement;
    // the header spans the nav AND the pane, so the matching bound is both
    expect(row).toHaveStyle(
      `max-width: ${getBoundedWidth() + NAV_COLUMN_WIDTH}px`
    );
  });

  it('lets go entirely when the page is opened to the window', () => {
    setPageWide(true);
    const { container } = renderComponent(
      <PageHeaderRow>
        <span>left</span>
      </PageHeaderRow>
    );
    expect(container.firstElementChild).toHaveStyle('max-width: none');
  });
});

/**
 * The strip's behaviours, which the route resolver deliberately knows
 * nothing about: `to` navigates, `href` is a real link in a new tab, and
 * ✕ hides THIS route's strip while you are on it — nobody else's page, and
 * not once you have left and come back.
 *
 * The dismissal tests drive a harness shaped like the layout: one
 * TopBarStrip whose `strip` prop changes as the route does. Rendering a
 * fresh component per route instead would pass against an implementation
 * that hides every page at once, because the bug only shows when React
 * reuses the instance across a navigation.
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { Route, useHistory, useLocation } from 'react-router-dom';
import TopBarStrip from '../TopBarStrip';

const strip = {
  route: '/insights',
  text: 'ICICLE Insights',
  actions: [
    { label: 'Services Board', to: '/home' },
    { label: 'Docs ↗', href: 'https://example.test/docs' },
  ],
  dismissible: true,
};

const STRIPS: Record<string, typeof strip> = {
  '/insights': strip,
  '/patra': { ...strip, route: '/patra', text: 'Patra Model Cards' },
};

/** one strip, prop swapped by navigation — the layout's shape */
const Harness: React.FC = () => {
  const { pathname } = useLocation();
  const history = useHistory();
  const current = STRIPS[pathname];
  return (
    <>
      <button onClick={() => history.push('/insights')}>to insights</button>
      <button onClick={() => history.push('/patra')}>to patra</button>
      {current ? <TopBarStrip strip={current} /> : null}
    </>
  );
};

const CLOSE = 'Hide this bar while I am on this page';

describe('TopBarStrip', () => {
  it('navigates in the app for a `to` action', () => {
    renderComponent(
      <>
        <TopBarStrip strip={strip} />
        <Route path="/home" render={() => <div>landed on home</div>} />
      </>
    );
    fireEvent.click(screen.getByText('Services Board'));
    expect(screen.getByText('landed on home')).toBeInTheDocument();
  });

  it('renders an `href` action as a new-tab link', () => {
    renderComponent(<TopBarStrip strip={strip} />);
    const link = screen.getByText('Docs ↗').closest('a');
    expect(link).toHaveAttribute('href', 'https://example.test/docs');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('the harness swaps strips on navigation', () => {
    renderComponent(<Harness />);
    fireEvent.click(screen.getByText('to insights'));
    expect(screen.getByText('ICICLE Insights')).toBeInTheDocument();
    fireEvent.click(screen.getByText('to patra'));
    expect(screen.getByText('Patra Model Cards')).toBeInTheDocument();
  });

  it('✕ hides this page only — every other page keeps its own strip', () => {
    renderComponent(<Harness />);
    fireEvent.click(screen.getByText('to insights'));
    fireEvent.click(screen.getByLabelText(CLOSE));
    expect(screen.queryByText('ICICLE Insights')).toBeNull();
    fireEvent.click(screen.getByText('to patra'));
    expect(screen.getByText('Patra Model Cards')).toBeInTheDocument();
  });

  it('the strip comes back when you return to the page you closed', () => {
    renderComponent(<Harness />);
    fireEvent.click(screen.getByText('to insights'));
    fireEvent.click(screen.getByLabelText(CLOSE));
    fireEvent.click(screen.getByText('to patra'));
    fireEvent.click(screen.getByText('to insights'));
    expect(screen.getByText('ICICLE Insights')).toBeInTheDocument();
  });

  it('✕ does not navigate — "back" is always a labelled action', () => {
    renderComponent(
      <>
        <Harness />
        <Route path="/home" render={() => <div>landed on home</div>} />
      </>
    );
    fireEvent.click(screen.getByText('to insights'));
    fireEvent.click(screen.getByLabelText(CLOSE));
    expect(screen.queryByText('landed on home')).toBeNull();
  });

  it('nothing is stored, so a reload shows the strip again', () => {
    const first = renderComponent(<TopBarStrip strip={strip} />);
    fireEvent.click(screen.getByLabelText(CLOSE));
    first.unmount();
    renderComponent(<TopBarStrip strip={strip} />);
    expect(screen.getByText('ICICLE Insights')).toBeInTheDocument();
  });

  it('shows no ✕ unless the strip is dismissible', () => {
    renderComponent(<TopBarStrip strip={{ ...strip, dismissible: false }} />);
    expect(screen.queryByLabelText(CLOSE)).toBeNull();
  });
});

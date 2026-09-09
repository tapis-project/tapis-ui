import React from 'react';
import { createPortal } from 'react-dom';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import SectionedPanel from '../SectionedPanel';
import { PanelGroup } from '../panelKit';

const groups: PanelGroup[] = [
  {
    label: 'Group',
    items: [
      {
        id: 'one',
        label: 'One',
        title: 'Section one',
        icon: <span />,
        render: () => <div>body one</div>,
      },
      {
        id: 'two',
        label: 'Two',
        title: 'Section two',
        icon: <span />,
        render: () => <div>body two</div>,
      },
    ],
  },
];

// jsdom reports every scroll metric as 0, so the content pane counts as both
// at-top and at-bottom. Only the downward direction is asserted here.
const flick = (times = 1) => {
  const pane = screen.getByText(/body/).parentElement as HTMLElement;
  for (let i = 0; i < times; i += 1) {
    // one flick = a burst carrying more than the 90px threshold
    fireEvent.wheel(pane, { deltaY: 60 });
    fireEvent.wheel(pane, { deltaY: 60 });
    // ...then quiet for longer than the gesture gap, ending it
    act(() => {
      jest.advanceTimersByTime(300);
    });
  }
};

// An unbroken scroll: wheel events with no quiet gap between them.
const scrollWithoutStopping = (totalDelta: number) => {
  const pane = screen.getByText(/body/).parentElement as HTMLElement;
  for (let sent = 0; sent < totalDelta; sent += 40) {
    fireEvent.wheel(pane, { deltaY: 40 });
    act(() => {
      jest.advanceTimersByTime(16); // ~60fps, well under the gesture gap
    });
  }
};

describe('SectionedPanel wheel paging', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('pages on a single flick by default', () => {
    render(<SectionedPanel groups={groups} title="Panel" />);
    expect(screen.getByText('body one')).toBeInTheDocument();
    flick();
    expect(screen.getByText('body two')).toBeInTheDocument();
  });

  it('asks for the flicks the host wants, counting down', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={2} />);

    flick();
    expect(screen.getByText('body one')).toBeInTheDocument();
    expect(screen.getByText('1 more scroll')).toBeInTheDocument();

    flick();
    expect(screen.getByText('body two')).toBeInTheDocument();
  });

  it('counts down in the plural while more than one flick is left', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={3} />);
    flick();
    expect(screen.getByText('2 more scrolls')).toBeInTheDocument();
    expect(screen.getByText('body one')).toBeInTheDocument();
  });

  it('forgets a half-finished streak after a long pause', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={3} />);
    flick(2);
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    flick(2);
    // the streak restarted, so two more flicks are not enough
    expect(screen.getByText('body one')).toBeInTheDocument();
  });

  it('keeps counting during one unbroken scroll', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={2} />);
    // first flick lands at 90px, the second after 200px more of travel
    scrollWithoutStopping(90 + 200 + 40);
    expect(screen.getByText('body two')).toBeInTheDocument();
  });

  it('does not page on a short continuous nudge', () => {
    render(<SectionedPanel groups={groups} title="Panel" pageGestures={2} />);
    scrollWithoutStopping(120);
    expect(screen.getByText('body one')).toBeInTheDocument();
  });
});

const three: PanelGroup[] = [
  {
    label: 'Group',
    items: ['one', 'two', 'three'].map((id) => ({
      id,
      label: id[0].toUpperCase() + id.slice(1),
      title: `Section ${id}`,
      icon: <span />,
      render: () => <div>body {id}</div>,
    })),
  },
];
const WALK = { skipTo: { id: 'three', label: 'skip to three' } };

describe('SectionedPanel walk', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('pages on the wheel and the keys too, counting down in the pager', () => {
    render(
      <SectionedPanel
        groups={three}
        title="Panel"
        walk={WALK}
        pageGestures={2}
      />
    );
    const pager = screen.getByRole('group', { name: 'Step navigation' });
    // the countdown takes the step's place, in the pager itself
    flick();
    expect(within(pager).getByText('1 more')).toBeInTheDocument();
    expect(within(pager).queryByText('step 1 of 3')).toBeNull();
    flick();
    expect(screen.getByText('body two')).toBeInTheDocument();
    expect(within(pager).getByText('step 2 of 3')).toBeInTheDocument();

    fireEvent.keyDown(screen.getByText('body two'), { key: 'ArrowDown' });
    expect(screen.getByText('body three')).toBeInTheDocument();
    fireEvent.keyDown(screen.getByText('body three'), { key: 'ArrowUp' });
    expect(screen.getByText('step 2 of 3')).toBeInTheDocument();
    // one pager, not two: the plain pair and its hint are not drawn as well
    expect(screen.queryByText('wheel / ↑↓ page sections')).toBeNull();
  });

  it('keeps the view switches in the pager, at the left of its second row', () => {
    const detailed: PanelGroup[] = [
      {
        ...three[0],
        items: three[0].items.map((s) => ({
          ...s,
          detail: <span>about {s.id}</span>,
        })),
      },
    ];
    render(
      <SectionedPanel
        groups={detailed}
        title="Panel"
        walk={{ ...WALK, tools: <button type="button">host switch</button> }}
      />
    );
    const pager = screen.getByRole('group', { name: 'Step navigation' });
    const toggle = within(pager).getByRole('button', {
      name: 'Toggle section descriptions',
    });
    const host = within(pager).getByRole('button', { name: 'host switch' });
    const where = within(pager).getByText('step 1 of 3');
    // in the pager, not in the head line
    expect(screen.getByText('Panel').parentElement!.contains(toggle)).toBe(
      false
    );
    // switches first, then the step: a switch that narrows the nav would
    // otherwise slide away from the hand that pressed it
    const follows = (a: Node, b: Node) =>
      !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(follows(toggle, host)).toBe(true);
    expect(follows(host, where)).toBe(true);
  });

  it('points the way the list runs: up is Back, down is Continue, one row', () => {
    render(<SectionedPanel groups={three} title="Panel" walk={WALK} />);
    const pager = screen.getByRole('group', { name: 'Step navigation' });
    // two rows in all: the presses, then where you are
    expect(pager.children).toHaveLength(2);
    const back = within(pager).getByRole('button', { name: 'Back' });
    const next = within(pager).getByRole('button', {
      name: 'Continue to Two',
    });
    // both presses in the first row, Back first
    const rowOf = (el: HTMLElement) => el.parentElement!.parentElement;
    expect(rowOf(back)).toBe(pager.children[0]);
    expect(rowOf(next)).toBe(pager.children[0]);
    expect(
      back.compareDocumentPosition(next) & Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(within(back).getByTestId('KeyboardArrowUpRoundedIcon')).toBeTruthy();
    expect(
      within(next).getByTestId('KeyboardArrowDownRoundedIcon')
    ).toBeTruthy();
    // and nothing in it points sideways
    expect(
      pager.querySelector(
        '[data-testid^="ArrowForward"], [data-testid^="ArrowBack"]'
      )
    ).toBeNull();
  });

  it('is one element for the whole walk, outside every scroller', () => {
    render(<SectionedPanel groups={three} title="Panel" walk={WALK} />);
    const pager = screen.getByRole('group', { name: 'Step navigation' });
    const next = within(pager).getByRole('button', { name: /^Continue/ });

    // two presses on the same spot walk two steps: the panel renders the
    // pager once, so nothing is remounted somewhere new between presses
    fireEvent.click(next);
    fireEvent.click(next);
    expect(screen.getByText('body three')).toBeInTheDocument();
    expect(screen.getByText('step 3 of 3')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Step navigation' })).toBe(pager);
    expect(within(pager).getByRole('button', { name: 'Continue' })).toBe(next);
    expect(next).toBeDisabled();

    // nothing between it and the nav scrolls, so a long list cannot carry it
    // off the bottom of the column
    let el = pager.parentElement;
    while (el && el.tagName !== 'NAV') {
      expect(window.getComputedStyle(el).overflowY).not.toMatch(/auto|scroll/);
      el = el.parentElement;
    }
    expect(el).not.toBeNull();
    const nav = window.getComputedStyle(el as HTMLElement);
    expect(`${nav.overflow} ${nav.overflowY}`).not.toMatch(/auto|scroll/);
  });

  it('skips to the end with a small press, gone once it is there', () => {
    render(<SectionedPanel groups={three} title="Panel" walk={WALK} />);
    fireEvent.click(screen.getByRole('button', { name: 'skip to three' }));
    expect(screen.getByText('body three')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'skip to three' })).toBeNull();
    // and the forward press is shut rather than gone
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('lets a host put its own press where the skip goes', () => {
    render(
      <SectionedPanel
        groups={three}
        title="Panel"
        walk={{ ...WALK, action: <button type="button">host action</button> }}
      />
    );
    const pager = screen.getByRole('group', { name: 'Step navigation' });
    expect(
      within(pager).getByRole('button', { name: 'host action' })
    ).toBeInTheDocument();
    expect(
      within(pager).queryByRole('button', { name: 'skip to three' })
    ).toBeNull();
  });

  it('rings the problem badges when the host asks, and only those', () => {
    const badged: PanelGroup[] = [
      {
        ...three[0],
        items: three[0].items.map((s, index) => ({
          ...s,
          badge:
            index === 0
              ? { label: '2', tone: 'blocking' as const }
              : { label: 'x', tone: 'planned' as const },
        })),
      },
    ];
    const { rerender } = render(
      <SectionedPanel groups={badged} title="Panel" />
    );
    const problem = () => screen.getByText('2').closest('.MuiChip-root');
    expect(problem()).not.toHaveAttribute('data-pulse');
    rerender(<SectionedPanel groups={badged} title="Panel" badgePulse={1} />);
    expect(problem()).toHaveAttribute('data-pulse', '1');
    // a count that is not a problem never rings
    expect(
      screen.getAllByText('x')[0].closest('.MuiChip-root')
    ).not.toHaveAttribute('data-pulse');
  });

  it('leaves a panel that is not a walk its arrows, and no pager', () => {
    render(<SectionedPanel groups={three} title="Panel" />);
    expect(screen.queryByRole('group', { name: 'Step navigation' })).toBeNull();
    expect(screen.getByText('wheel / ↑↓ page sections')).toBeInTheDocument();
  });
});

// A section that opens a modal: the modal lives in a portal, outside the
// pane, the way a file browser opened from a launcher step does.
const withOverlay: PanelGroup[] = [
  {
    label: 'Group',
    items: [
      {
        id: 'one',
        label: 'One',
        title: 'Section one',
        icon: <span />,
        render: () => (
          <div>
            body one
            {createPortal(
              <div data-testid="overlay">a file browser</div>,
              document.body
            )}
          </div>
        ),
      },
      {
        id: 'two',
        label: 'Two',
        title: 'Section two',
        icon: <span />,
        render: () => <div>body two</div>,
      },
    ],
  },
];

describe('SectionedPanel and an overlay opened from a section', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  // its events reach the panel through React though it is not in the pane;
  // paging on them unmounted the section and closed the overlay with it
  it('does not page on a wheel inside the overlay', () => {
    render(<SectionedPanel groups={withOverlay} title="Panel" />);
    const overlay = screen.getByTestId('overlay');
    for (let i = 0; i < 3; i += 1) {
      fireEvent.wheel(overlay, { deltaY: 60 });
      fireEvent.wheel(overlay, { deltaY: 60 });
      act(() => {
        jest.advanceTimersByTime(300);
      });
    }
    expect(screen.getByText(/body one/)).toBeInTheDocument();
  });

  it('does not page on arrow keys pressed inside the overlay', () => {
    render(<SectionedPanel groups={withOverlay} title="Panel" />);
    fireEvent.keyDown(screen.getByTestId('overlay'), { key: 'ArrowDown' });
    expect(screen.getByText(/body one/)).toBeInTheDocument();
  });

  it('still pages on a wheel in the pane itself', () => {
    render(<SectionedPanel groups={withOverlay} title="Panel" />);
    flick();
    expect(screen.getByText('body two')).toBeInTheDocument();
  });
});

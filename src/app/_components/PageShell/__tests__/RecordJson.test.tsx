/**
 * The record view. Most of the value is in `prune` — a Tapis record is
 * well over half nulls and empty lists, and showing them by default is
 * what made the old slab a scroll instead of an answer.
 */
import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import RecordJson, { prune } from '../RecordJson';

describe('prune', () => {
  it('drops nulls, blanks and empty containers', () => {
    expect(
      prune({
        id: 'frontera',
        notes: null,
        tags: [],
        batch: {},
        description: '',
        enabled: false,
        port: 0,
      })
      // false and 0 are ANSWERS — only absence goes
    ).toEqual({ id: 'frontera', enabled: false, port: 0 });
  });

  it('drops a branch left empty by the pruning of its own children', () => {
    expect(prune({ a: { b: null, c: [] }, d: 1 })).toEqual({ d: 1 });
  });

  it('keeps a branch that still has something in it', () => {
    expect(prune({ a: { b: null, c: 'x' } })).toEqual({ a: { c: 'x' } });
  });

  it('prunes inside arrays too', () => {
    expect(prune({ list: [{ a: null }, { b: 2 }] })).toEqual({
      list: [{ b: 2 }],
    });
  });
});

const record = {
  id: 'frontera',
  host: 'frontera.tacc.utexas.edu',
  notes: null,
  batchLogicalQueues: [{ name: 'normal', maxJobs: 50 }],
};

describe('the card', () => {
  it('says which record it is and how much of it there is', () => {
    renderComponent(<RecordJson title="System record" json={record} />);
    expect(screen.getByText('System record')).toBeInTheDocument();
    // three, not four: the null is not a field worth counting by default
    expect(screen.getByText('3 fields')).toBeInTheDocument();
  });

  it('hides the unset fields until asked', () => {
    renderComponent(<RecordJson title="System record" json={record} />);
    expect(screen.queryByText('notes')).toBeNull();
    fireEvent.click(screen.getByText('empty fields'));
    expect(screen.getByText('notes')).toBeInTheDocument();
    expect(screen.getByText('null')).toBeInTheDocument();
  });

  it('opens far enough down to read an object in a list without a press', () => {
    renderComponent(
      <RecordJson
        title="Job definition"
        // record -> parameterSet -> appArgs -> the arg itself, which is the
        // shape every one of these records has and the thing being read
        json={{ parameterSet: { appArgs: [{ name: 'trace', arg: '--v' }] } }}
      />
    );
    expect(screen.getByText('"trace"')).toBeInTheDocument();
    expect(screen.getByText('"--v"')).toBeInTheDocument();
  });

  it('still makes the fifth level a press, and says what is in it while shut', () => {
    renderComponent(
      <RecordJson
        title="System record"
        json={{ a: { b: { c: { d: { e: 'deep' } } } } }}
      />
    );
    expect(screen.queryByText('"deep"')).toBeNull();
    // shut, it still answers: one key inside
    expect(screen.getByText('{ 1 }')).toBeInTheDocument();
    fireEvent.click(screen.getByText('d'));
    expect(screen.getByText('"deep"')).toBeInTheDocument();
  });

  it('leaves a long list shut, however shallow it is', () => {
    const many = Array.from({ length: 41 }, (_, i) => ({ n: i }));
    renderComponent(<RecordJson title="System record" json={{ many }} />);
    // 41 rows is past the cap, so the tree does not unroll on open; the row
    // still says how much is behind it
    expect(screen.getByText('[ 41 ]')).toBeInTheDocument();
    fireEvent.click(screen.getByText('many'));
    expect(screen.getAllByText('n').length).toBe(41);
  });

  it('collapses and expands the whole tree from one menu', () => {
    renderComponent(
      <RecordJson
        title="System record"
        json={{ parameterSet: { appArgs: [{ name: 'trace', arg: '--v' }] } }}
      />
    );
    // the press wears the current choice, so it is also the label to find
    const menu = () => screen.getByLabelText('How far the tree opens itself');
    const choose = (label: string) => {
      fireEvent.click(menu());
      fireEvent.click(screen.getByRole('menuitem', { name: label }));
    };

    // three levels by default, so the arg reads without a press
    expect(screen.getByText('"trace"')).toBeInTheDocument();

    choose('top level');
    // the tree took the new default: only the record's own fields are open
    expect(screen.queryByText('"trace"')).toBeNull();
    expect(screen.getByText('appArgs')).toBeInTheDocument();

    choose('collapse all');
    expect(screen.queryByText('appArgs')).toBeNull();
    expect(screen.getByText('parameterSet')).toBeInTheDocument();

    // and a branch is still its own press afterwards
    fireEvent.click(screen.getByText('parameterSet'));
    expect(screen.getByText('appArgs')).toBeInTheDocument();
  });

  it('expand all opens past the row cap, because it was asked for', () => {
    const many = Array.from({ length: 41 }, (_, i) => ({ n: i }));
    renderComponent(<RecordJson title="System record" json={{ many }} />);
    // shut at rest: 41 rows is past the cap
    expect(screen.getByText('[ 41 ]')).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('How far the tree opens itself'));
    fireEvent.click(screen.getByRole('menuitem', { name: 'expand all' }));
    expect(screen.getAllByText('n')).toHaveLength(41);
  });

  it('closes on its own press', () => {
    const onClose = jest.fn();
    renderComponent(
      <RecordJson title="System record" json={record} onClose={onClose} />
    );
    fireEvent.click(screen.getByText('close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('copies what is actually shown, as JSON, not the raw record', () => {
    const writeText = jest.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    renderComponent(<RecordJson title="System record" json={record} />);
    fireEvent.click(screen.getByText('copy JSON'));
    expect(writeText).toHaveBeenCalled();
    // the JSON text itself, quoted keys and all
    expect(writeText.mock.calls[0][0]).toMatch(
      /"host": "frontera\.tacc\.utexas\.edu"/
    );
    expect(writeText.mock.calls[0][0]).not.toMatch(/notes/);
  });

  it('says so plainly when a record is entirely unset', () => {
    renderComponent(<RecordJson title="Notes" json={{ a: null }} />);
    expect(screen.getByText(/Nothing set on this record/)).toBeInTheDocument();
  });

  it('folds to its top bar, and opens again from it', () => {
    renderComponent(<RecordJson title="System record" json={record} />);
    const title = screen.getByRole('button', { name: 'System record' });
    expect(title).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('host')).toBeInTheDocument();

    fireEvent.click(title);
    expect(title).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('host')).toBeNull();

    // the bar itself is the press, not only the title
    fireEvent.click(screen.getByText('3 fields'));
    expect(screen.getByText('host')).toBeInTheDocument();
    // and its own presses do their own thing, leaving it open
    fireEvent.click(screen.getByText('empty fields'));
    expect(screen.getByText('notes')).toBeInTheDocument();
  });

  it('starts at the depth it is given', () => {
    renderComponent(
      <RecordJson
        title="Job definition"
        json={{ parameterSet: { appArgs: [{ name: 'trace', arg: '--v' }] } }}
        defaultDepth={2}
      />
    );
    // two levels: parameterSet and appArgs open, the arg itself still shut
    expect(screen.getByText('appArgs')).toBeInTheDocument();
    expect(screen.queryByText('"trace"')).toBeNull();
    expect(
      screen.getByLabelText('How far the tree opens itself')
    ).toHaveTextContent('2 levels');
  });

  it('shows the JSON text itself on request, quotes and all', () => {
    renderComponent(<RecordJson title="System record" json={record} />);
    fireEvent.click(screen.getByText('raw JSON'));
    expect(screen.getByText('"host"')).toBeInTheDocument();
    expect(screen.getByText('"frontera.tacc.utexas.edu"')).toBeInTheDocument();
    // a depth means nothing to text
    expect(screen.queryByLabelText('How far the tree opens itself')).toBeNull();

    fireEvent.click(screen.getByText('raw JSON'));
    expect(screen.getByText('host')).toBeInTheDocument();
  });
});

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

  it('opens a branch on the press, and says what is in it while shut', () => {
    renderComponent(
      <RecordJson
        title="System record"
        // deep enough to start shut: the default only opens the top level
        json={{ a: { b: { c: { d: 'deep' } } } }}
      />
    );
    expect(screen.queryByText('"deep"')).toBeNull();
    fireEvent.click(screen.getByText('b'));
    fireEvent.click(screen.getByText('c'));
    expect(screen.getByText('"deep"')).toBeInTheDocument();
  });

  it('closes on its own press', () => {
    const onClose = jest.fn();
    renderComponent(
      <RecordJson title="System record" json={record} onClose={onClose} />
    );
    fireEvent.click(screen.getByText('close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('copies what is actually shown, not the raw record', () => {
    const writeText = jest.fn();
    Object.assign(navigator, { clipboard: { writeText } });
    renderComponent(<RecordJson title="System record" json={record} />);
    fireEvent.click(screen.getByText('copy'));
    expect(writeText).toHaveBeenCalled();
    expect(writeText.mock.calls[0][0]).not.toMatch(/notes/);
  });

  it('says so plainly when a record is entirely unset', () => {
    renderComponent(<RecordJson title="Notes" json={{ a: null }} />);
    expect(screen.getByText(/Nothing set on this record/)).toBeInTheDocument();
  });
});

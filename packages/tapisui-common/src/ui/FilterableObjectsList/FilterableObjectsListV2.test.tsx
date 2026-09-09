import React from 'react';
import { expect, describe, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import FilterableObjectsListV2 from './FilterableObjectsListV2';

const OBJECTS = [
  { id: 'stampede2', owner: 'jdoe' },
  { id: 'frontera', owner: 'jdoe' },
  { id: 'scratch', owner: 'bob' },
];

const list = (objects: any[] = OBJECTS) => (
  <FilterableObjectsListV2
    objects={objects}
    title="Systems"
    includeAll={false}
    filterable={false}
    defaultGroupsOn={true}
    defaultSortBy="owner"
    sortOptions={[
      {
        id: 'owner',
        label: 'Owner',
        comparator: (a: any, b: any) =>
          String(a.id).localeCompare(String(b.id)),
        groupField: 'owner',
      },
    ]}
    groups={[
      {
        field: 'owner',
        groupSelectorLabel: 'owner',
        open: ['*'],
        groupLabel: ({ fieldValue }: any) => `owned by ${fieldValue}`,
        primaryItemText: ({ object }: any) => object.id ?? 'none',
        onClickItem: () => {},
      },
    ]}
  />
);

describe('FilterableObjectsListV2 listing', () => {
  it('renders with filtering on, the default for every nav', () => {
    render(
      <FilterableObjectsListV2
        objects={OBJECTS}
        title="Systems"
        includeAll={true}
        groups={[
          {
            field: 'owner',
            groupSelectorLabel: 'owner',
            open: ['*'],
            groupLabel: ({ fieldValue }: any) => `owned by ${fieldValue}`,
            primaryItemText: ({ object }: any) => object.id ?? 'none',
            onClickItem: () => {},
          },
        ]}
      />
    );
    expect(screen.getByText('stampede2')).toBeTruthy();
  });
});

describe('FilterableObjectsListV2 group headers', () => {
  it('are buttons that toggle on Enter and Space', () => {
    render(list());
    const header = screen.getByText('owned by jdoe').closest('[role=button]')!;
    expect(header.getAttribute('tabindex')).toBe('0');
    expect(header.getAttribute('aria-expanded')).toBe('true');

    fireEvent.keyDown(header, { key: 'Enter' });
    expect(screen.queryByText('stampede2')).toBeNull();
    expect(header.getAttribute('aria-expanded')).toBe('false');

    fireEvent.keyDown(header, { key: ' ' });
    expect(screen.getByText('stampede2')).toBeTruthy();
  });

  it('ignore other keys', () => {
    render(list());
    const header = screen.getByText('owned by jdoe').closest('[role=button]')!;
    fireEvent.keyDown(header, { key: 'ArrowDown' });
    expect(screen.getByText('stampede2')).toBeTruthy();
  });
});

describe('FilterableObjectsListV2 rows', () => {
  it('render objects that share an id or have none', () => {
    render(
      list([
        { id: 'dup', owner: 'jdoe' },
        { id: 'dup', owner: 'jdoe' },
        { owner: 'jdoe' },
      ])
    );
    expect(screen.getAllByText('dup')).toHaveLength(2);
  });
});

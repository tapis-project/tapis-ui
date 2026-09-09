import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import { FilterableObjectsListV2 } from '@tapis/tapisui-common';

/**
 * Group collapse across the V2 navs.
 *
 * Several navs (Files' owner and type groups, Apps' and Jobs' too) declare
 * `open: ['*']` — every group in the field starts open. The wildcard used to
 * satisfy the open check forever, so clicking those headers could never
 * collapse them, while sorts whose groups list explicit values collapsed
 * fine. The mix made it read as "some of the sorts are broken".
 */

const SYSTEMS = [
  { id: 'stampede2', owner: 'cgarcia' },
  { id: 'frontera', owner: 'cgarcia' },
  { id: 'shared-scratch', owner: 'bob' },
];

const render = () =>
  renderComponent(
    <FilterableObjectsListV2
      objects={SYSTEMS}
      title="Systems"
      includeAll={false}
      filterable={false}
      searchable={false}
      defaultGroupsOn={true}
      defaultSortBy="owner"
      sortOptions={[
        {
          id: 'owner',
          label: 'Owner',
          comparator: (a: any, b: any) => a.id.localeCompare(b.id),
          groupField: 'owner',
        },
      ]}
      groups={[
        {
          field: 'owner',
          groupSelectorLabel: 'owner',
          // the wildcard default-open — the shape that could not collapse
          open: ['*'],
          groupLabel: ({ fieldValue }: any) => `owned by ${fieldValue}`,
          primaryItemText: ({ object }: any) => object.id,
          onClickItem: () => {},
        },
      ]}
    />
  );

describe('a group opened by wildcard', () => {
  it('starts open, like the wildcard asks', () => {
    render();
    expect(screen.getByText('owned by cgarcia')).toBeInTheDocument();
    expect(screen.getByText('stampede2')).toBeInTheDocument();
    expect(screen.getByText('shared-scratch')).toBeInTheDocument();
  });

  it('closes when its header is pressed, and only it', () => {
    render();
    fireEvent.click(screen.getByText('owned by cgarcia'));
    expect(screen.queryByText('stampede2')).toBeNull();
    expect(screen.queryByText('frontera')).toBeNull();
    // the neighbour keeps the wildcard's default
    expect(screen.getByText('shared-scratch')).toBeInTheDocument();
  });

  it('opens again on the next press', () => {
    render();
    const header = screen.getByText('owned by cgarcia');
    fireEvent.click(header);
    expect(screen.queryByText('stampede2')).toBeNull();
    fireEvent.click(header);
    expect(screen.getByText('stampede2')).toBeInTheDocument();
  });
});

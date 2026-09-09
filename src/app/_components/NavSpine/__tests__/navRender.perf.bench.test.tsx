import React from 'react';
import { render } from '@testing-library/react';
import { FilterableObjectsListV2 } from '@tapis/tapisui-common';

/**
 * What the 50-window buys on the client, measured.
 *
 * jsdom numbers are not browser numbers — no layout, no paint — but React
 * render work scales the same way, and that is the half the spine controls:
 * a nav that mounts 50 rows instead of everything does proportionally less
 * of it. The numbers print so bench-over-time has a record; the assertion
 * only pins the direction, not a budget, because CI machines vary.
 *
 * Run with the suite, or alone:
 *   node node_modules/jest/bin/jest.js navRender.perf
 */

const mkObjects = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `system-${String(i).padStart(4, '0')}`,
    owner: i % 7 ? 'cgarcia' : 'someone-else',
    _group: i % 2 ? 'a' : 'b',
  }));

const renderList = (objects: object[]) =>
  render(
    <FilterableObjectsListV2
      objects={objects}
      title="Systems"
      includeAll={false}
      filterable={false}
      searchable={false}
      defaultGroupsOn={true}
      defaultSortBy="id"
      sortOptions={[
        {
          id: 'id',
          label: 'Id',
          comparator: (a: any, b: any) => a.id.localeCompare(b.id),
          groupField: '_group',
        },
      ]}
      groups={[
        {
          field: '_group',
          groupSelectorLabel: 'group',
          open: ['*'],
          groupLabel: ({ fieldValue }: any) => `group ${fieldValue}`,
          primaryItemText: ({ object }: any) => object.id,
          onClickItem: () => {},
        },
      ]}
    />
  );

const time = (objects: object[]) => {
  const t0 = performance.now();
  const { unmount } = renderList(objects);
  const ms = performance.now() - t0;
  unmount();
  return ms;
};

describe('mounting a nav window vs mounting the world', () => {
  it('50 rows cost less than 500 — the spine claim, in render terms', () => {
    // warmup pays the module/transform tax so neither side carries it
    time(mkObjects(10));
    const windowMs = time(mkObjects(50));
    const worldMs = time(mkObjects(500));
    // eslint-disable-next-line no-console
    console.info(
      `[navRender.perf] 50 rows: ${windowMs.toFixed(0)}ms · ` +
        `500 rows: ${worldMs.toFixed(0)}ms · ` +
        `ratio ×${(worldMs / windowMs).toFixed(1)}`
    );
    expect(worldMs).toBeGreaterThan(windowMs);
  }, 60_000);
});

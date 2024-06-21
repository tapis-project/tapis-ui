import { expect, describe, it } from 'vitest';
import breadcrumbsFromPathname from './breadcrumbsFromPathname';

describe('Breadcrumbs from pathname function', () => {
  it('converts a pathname into an Array of BreadcrumbTypes', () => {
    expect(breadcrumbsFromPathname('/files/')).toEqual([
      { to: '/files', text: 'files' },
    ]);
    expect(breadcrumbsFromPathname('/files/system/')).toEqual([
      { to: '/files', text: 'files' },
      { to: '/files/system', text: 'system' },
    ]);
    expect(breadcrumbsFromPathname('/files/system/dir/')).toEqual([
      { to: '/files', text: 'files' },
      { to: '/files/system', text: 'system' },
      { to: '/files/system/dir', text: 'dir' },
    ]);
  });
});

import React from 'react';
import renderComponent from 'utils/testing';
import Breadcrumbs from 'tapis-ui/_common/Breadcrumbs';
import breadcrumbsFromPathname from './breadcrumbsFromPathname';

const _1_DIRS = breadcrumbsFromPathname('/files');
const _1_DIRS_TRAILING_SLASH = breadcrumbsFromPathname('/files/');
const _3_DIRS = breadcrumbsFromPathname('/files/system/dir1/');
const _4_DIRS = breadcrumbsFromPathname('/files/system/dir1/dir2/');
const _5_DIRS = breadcrumbsFromPathname('/files/system/dir1/dir2/dir3/');

describe('Breadcrumbs component', () => {
  it('renders 0 Breadcrumbs without an ellipsis', () => {
    const { queryAllByText } = renderComponent(
      <Breadcrumbs breadcrumbs={_1_DIRS} />
    );
    expect(queryAllByText(/files/).length).toEqual(1);
  });

  it('renders 1 Breadcrumb without an ellipsis', () => {
    const { queryAllByText } = renderComponent(
      <Breadcrumbs breadcrumbs={_1_DIRS_TRAILING_SLASH} />
    );
    expect(queryAllByText(/files/).length).toEqual(1);
  });

  it('renders 3 Breadcrumbs without an ellipsis', () => {
    const { queryAllByText } = renderComponent(
      <Breadcrumbs breadcrumbs={_3_DIRS} />
    );
    // \u2026 == &hellip; (horizonal ellipsis)
    expect(queryAllByText(/\u2026/).length).toEqual(0);

    // Check that breadcrumbs are providing the appropriate text
    expect(queryAllByText(/files/).length).toEqual(1);
    expect(queryAllByText(/system/).length).toEqual(1);
    expect(queryAllByText(/dir1/).length).toEqual(1);
  });

  it('renders 4 Breadcrumbs without an ellipsis', () => {
    const { queryAllByText } = renderComponent(
      <Breadcrumbs breadcrumbs={_4_DIRS} />
    );
    // \u2026 == &hellip; (horizonal ellipsis)
    expect(queryAllByText(/\u2026/).length).toEqual(0);

    // Check that breadcrumbs are providing the appropriate text
    expect(queryAllByText(/files/).length).toEqual(1);
    expect(queryAllByText(/system/).length).toEqual(1);
    expect(queryAllByText(/dir1/).length).toEqual(1);
    expect(queryAllByText(/dir2/).length).toEqual(1);
  });

  it('renders 5 Breadcrumbs with an ellipsis', () => {
    const { getAllByText, queryAllByText } = renderComponent(
      <Breadcrumbs breadcrumbs={_5_DIRS} truncate={true} />
    );
    // Check that breadcrumbs are providing the appropriate text
    expect(queryAllByText(/files/).length).toEqual(1);
    expect(queryAllByText(/system/).length).toEqual(1);

    // \u2026 == &hellip; (horizonal ellipsis)
    expect(getAllByText(/\u2026/).length).toEqual(1);

    expect(queryAllByText(/dir2/).length).toEqual(1);
    expect(queryAllByText(/dir3/).length).toEqual(1);
  });
});

import React from 'react';
import renderComponent from 'utils/testing';
import Breadcrumbs from 'tapis-ui/_common/Breadcrumbs';
import breadcrumbsFromPathname from './breadcrumbsFromPathname';

const _4_BREADCRUMBS = breadcrumbsFromPathname("/files/system/a/b/")
const _5_BREADCRUMBS = breadcrumbsFromPathname("/files/system/a/b/c/")

describe('Breadcrumbs', () => {
  it('renders Breadcrumbs without an ellipsis', () => {
    const { queryAllByText } = renderComponent(
      <Breadcrumbs breadcrumbs={_4_BREADCRUMBS} />
    )
    // \u2026 == &hellip; (horizonal ellipsis)
    expect(queryAllByText(/\u2026/).length).toEqual(0)
  });
  it('renders Breadcrumbs with an ellipsis', () => {
    const { getAllByText } = renderComponent(
      <Breadcrumbs breadcrumbs={_5_BREADCRUMBS} />
    )
    // \u2026 == &hellip; (horizonal ellipsis)
    expect(getAllByText(/\u2026/).length).toEqual(1)
  });
});

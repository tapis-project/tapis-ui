import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import SitesNav from './SitesNav';
import { project } from 'fixtures/streams/projects.fixtures';
import { site } from "fixtures/streams/sites.fixtures";
import { useList } from 'tapis-hooks/systems';

jest.mock('tapis-hooks/systems');

describe('SitesList', () => {
  it('renders SitesList component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [site],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<SitesNav projectId={project.project_name!} />);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
});

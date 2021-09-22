import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import ProjectsNav from './ProjectsNav';
import { project } from 'fixtures/streams/projects.fixtures';
import { useList } from 'tapis-hooks/systems';

jest.mock('tapis-hooks/systems');

describe('ProjectsList', () => {
  it('renders ProjectsList component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [project],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<ProjectsNav />);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
});

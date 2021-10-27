import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import ProjectsNav from './ProjectsNav';
import { project } from 'fixtures/streams/projects.fixtures';
import { useList } from 'tapis-hooks/streams/projects';

jest.mock('tapis-hooks/streams/projects');

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
    expect(getAllByText(project.project_name!).length).toEqual(1);
  });
});

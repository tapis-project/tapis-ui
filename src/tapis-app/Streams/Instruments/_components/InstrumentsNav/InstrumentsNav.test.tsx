import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import InstrumentsNav from './InstrumentsNav';
import { project } from 'fixtures/streams/projects.fixtures';
import { site } from "fixtures/streams/sites.fixtures";
import { instrument } from 'fixtures/streams/instruments.fixtures';
import { useList } from 'tapis-hooks/systems';

jest.mock('tapis-hooks/systems');

describe('InstrumentsList', () => {
  it('renders InstrumentsList component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [instrument],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<InstrumentsNav projectId={project.project_name!} siteId={site.site_name!} />);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
});

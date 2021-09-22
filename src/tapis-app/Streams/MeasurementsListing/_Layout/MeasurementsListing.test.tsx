import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import MeasurementsListing from './Layout';
import { project } from 'fixtures/streams/projects.fixtures';
import { site } from "fixtures/streams/sites.fixtures";
import { instrument } from 'fixtures/streams/instruments.fixtures';
import { measurements } from 'fixtures/streams/measurements.fixtures';
import { useList } from 'tapis-hooks/systems';

jest.mock('tapis-hooks/systems');

describe('MeasurementsList', () => {
  it('renders MeasurementsList component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [measurements],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(<MeasurementsListing projectId={project.project_name!} siteId={site.site_name!} instrumentId={instrument.inst_name!} />);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
});

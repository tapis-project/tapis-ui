import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import MeasurementsListing from './Layout';
import { project } from 'fixtures/streams/projects.fixtures';
import { site } from 'fixtures/streams/sites.fixtures';
import { instrument } from 'fixtures/streams/instruments.fixtures';
import { measurements } from 'fixtures/streams/measurements.fixtures';
import { useList } from 'tapis-hooks/streams/measurements';

jest.mock('tapis-hooks/streams/measurements');

describe('MeasurementsList', () => {
  it('renders MeasurementsList component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: measurements,
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(
      <MeasurementsListing
        projectId={project.project_name!}
        siteId={site.site_name!}
        instrumentId={instrument.inst_name!}
      />
    );
    const {
      instrument: i,
      site: s,
      measurements_in_file: m,
      ...variableProps
    } = measurements;
    for (let varName in variableProps) {
      expect(getAllByText(varName).length).toEqual(1);
    }
  });
});

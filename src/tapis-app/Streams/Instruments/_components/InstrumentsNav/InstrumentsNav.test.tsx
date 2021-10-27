import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import InstrumentsNav from './InstrumentsNav';
import { project } from 'fixtures/streams/projects.fixtures';
import { site } from 'fixtures/streams/sites.fixtures';
import { instrument } from 'fixtures/streams/instruments.fixtures';
import { useList } from 'tapis-hooks/streams/instruments';

jest.mock('tapis-hooks/streams/instruments');

describe('InstrumentsList', () => {
  it('renders InstrumentsList component', () => {
    (useList as jest.Mock).mockReturnValue({
      data: {
        result: [instrument],
      },
      isLoading: false,
      error: null,
    });

    const { getAllByText } = renderComponent(
      <InstrumentsNav
        projectId={project.project_name!}
        siteId={site.site_name!}
      />
    );
    expect(getAllByText(instrument.inst_name!).length).toEqual(1);
  });
});

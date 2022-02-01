import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { tapisApp } from 'fixtures/apps.fixtures';
import { useJobBuilder } from 'tapis-hooks/jobs/jobBuilder';
import { FileInputsSummary } from './FileInputs';
import { Apps } from '@tapis/tapis-typescript';

jest.mock('tapis-hooks/jobs/jobLauncher');

describe('FileInputsSummary step', () => {
  it('Shows fileInputs', () => {
    (useJobBuilder as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [
          {
            name: 'Data file',
          },
        ],
      },
    });
    const { getAllByText } = renderComponent(
      <FileInputsSummary app={tapisApp} />
    );
    expect(getAllByText(/Data file/).length).toEqual(1);
  });
  it('Shows fileInputs that are incomplete', () => {
    (useJobBuilder as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [
          {
            name: 'Data file',
          },
          {
            sourceUrl: 'userspecified',
          },
        ],
      },
    });
    const incompleteApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    incompleteApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    const { getAllByText } = renderComponent(
      <FileInputsSummary app={incompleteApp} />
    );
    expect(
      getAllByText(/Data file is missing required information/).length
    ).toEqual(1);
    expect(
      getAllByText(/userspecified is missing required information/).length
    ).toEqual(1);
  });
  it('Shows fileInputs that are included by default', () => {
    (useJobBuilder as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [],
      },
    });
    const { getAllByText } = renderComponent(
      <FileInputsSummary app={tapisApp} />
    );
    expect(getAllByText(/Data file included by default/).length).toEqual(1);
  });
  it('Shows fileInputs that do not include underspecified required app inputs', () => {
    (useJobBuilder as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [],
      },
    });
    const incompleteApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    incompleteApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    const { getAllByText } = renderComponent(
      <FileInputsSummary app={incompleteApp} />
    );
    expect(getAllByText(/Data file is required/).length).toEqual(1);
  });
});

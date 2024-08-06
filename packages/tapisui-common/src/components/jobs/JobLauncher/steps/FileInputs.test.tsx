import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../../../testing/utils';
import { tapisApp } from '../../../../fixtures/apps.fixtures';
import useJobLauncher from '../../../../components/jobs/JobLauncher/components/useJobLauncher';
import { FileInputsSummary } from './FileInputs';
import { Apps } from '@tapis/tapis-typescript';

jest.mock('components/jobs/JobLauncher/components/useJobLauncher');

describe('FileInputsSummary step', () => {
  it('Shows fileInputs', () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [
          {
            name: 'required-incomplete',
          },
        ],
      },
      app: tapisApp,
    });
    const { getAllByText } = renderComponent(<FileInputsSummary />);
    expect(getAllByText(/required-incomplete/).length).toEqual(1);
  });
  it('Shows fileInputs that are incomplete', () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [
          {
            name: 'required-incomplete',
          },
          {
            sourceUrl: 'userspecified',
          },
        ],
      },
      app: tapisApp,
    });

    const { getAllByText } = renderComponent(<FileInputsSummary />);
    expect(
      getAllByText(/required-incomplete is missing required information/).length
    ).toEqual(1);
    expect(
      getAllByText(/userspecified is missing required information/).length
    ).toEqual(1);
  });
  it('Shows fileInputs that are included by default', () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [],
      },
      app: tapisApp,
    });
    const { getAllByText } = renderComponent(<FileInputsSummary />);
    expect(
      getAllByText(/required-complete included by default/).length
    ).toEqual(1);
  });
  it('Shows fileInputs that do not include underspecified required app inputs', () => {
    const incompleteApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    incompleteApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputs: [],
      },
      app: incompleteApp,
    });
    const { getAllByText } = renderComponent(<FileInputsSummary />);
    expect(getAllByText(/required-complete is required/).length).toEqual(1);
  });
});

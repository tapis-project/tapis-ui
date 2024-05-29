import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../../../testing/utils';
import { tapisApp } from '../../../../fixtures/apps.fixtures';
import useJobLauncher from '../../../../components/jobs/JobLauncher/components/useJobLauncher';
import { FileInputArraysSummary } from './FileInputArrays';
import { Apps } from '@tapis/tapis-typescript';

jest.mock('components/jobs/JobLauncher/components/useJobLauncher');

describe('FileInputArraysSummary step', () => {
  it('Shows fileInputArrays summary', () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputArrays: [
          {
            name: 'required-incomplete',
          },
        ],
      },
      app: tapisApp,
    });
    const { getAllByText } = renderComponent(<FileInputArraysSummary />);
    expect(getAllByText(/required-incomplete \(0 files\)/).length).toEqual(1);
  });
  it.skip('Shows fileInputArrays that are incomplete', () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputArrays: [
          {
            name: 'required-incomplete',
          },
          {
            sourceUrls: ['userspecified'],
          },
        ],
      },
      app: tapisApp,
    });
    const { getAllByText } = renderComponent(<FileInputArraysSummary />);
    expect(
      getAllByText(/required-incomplete is missing required information/).length
    ).toEqual(1);
    expect(
      getAllByText(/userspecified... is missing required information/).length
    ).toEqual(1);
  });
  it('Shows fileInputArrays that are included by default', () => {
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputArrays: [],
      },
      app: tapisApp,
    });
    const { getAllByText } = renderComponent(<FileInputArraysSummary />);
    expect(
      getAllByText(/required-complete included by default/).length
    ).toEqual(1);
  });
  it('Shows fileInputArrays that do not include underspecified required app inputs', () => {
    const incompleteApp: Apps.TapisApp = JSON.parse(JSON.stringify(tapisApp));
    incompleteApp.jobAttributes!.fileInputs![0].sourceUrl = undefined;
    (useJobLauncher as jest.Mock).mockReturnValue({
      job: {
        fileInputArrays: [],
      },
      app: incompleteApp,
    });
    const { getAllByText } = renderComponent(<FileInputArraysSummary />);
    expect(getAllByText(/required-complete is required/).length).toEqual(1);
  });
});

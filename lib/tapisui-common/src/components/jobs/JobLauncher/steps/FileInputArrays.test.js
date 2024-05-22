import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import { tapisApp } from 'fixtures/apps.fixtures';
import useJobLauncher from 'components/jobs/JobLauncher/components/useJobLauncher';
import { FileInputArraysSummary } from './FileInputArrays';
jest.mock('components/jobs/JobLauncher/components/useJobLauncher');
describe('FileInputArraysSummary step', function () {
    it('Shows fileInputArrays summary', function () {
        useJobLauncher.mockReturnValue({
            job: {
                fileInputArrays: [
                    {
                        name: 'required-incomplete',
                    },
                ],
            },
            app: tapisApp,
        });
        var getAllByText = renderComponent(_jsx(FileInputArraysSummary, {})).getAllByText;
        expect(getAllByText(/required-incomplete \(0 files\)/).length).toEqual(1);
    });
    it.skip('Shows fileInputArrays that are incomplete', function () {
        useJobLauncher.mockReturnValue({
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
        var getAllByText = renderComponent(_jsx(FileInputArraysSummary, {})).getAllByText;
        expect(getAllByText(/required-incomplete is missing required information/).length).toEqual(1);
        expect(getAllByText(/userspecified... is missing required information/).length).toEqual(1);
    });
    it('Shows fileInputArrays that are included by default', function () {
        useJobLauncher.mockReturnValue({
            job: {
                fileInputArrays: [],
            },
            app: tapisApp,
        });
        var getAllByText = renderComponent(_jsx(FileInputArraysSummary, {})).getAllByText;
        expect(getAllByText(/required-complete included by default/).length).toEqual(1);
    });
    it('Shows fileInputArrays that do not include underspecified required app inputs', function () {
        var incompleteApp = JSON.parse(JSON.stringify(tapisApp));
        incompleteApp.jobAttributes.fileInputs[0].sourceUrl = undefined;
        useJobLauncher.mockReturnValue({
            job: {
                fileInputArrays: [],
            },
            app: incompleteApp,
        });
        var getAllByText = renderComponent(_jsx(FileInputArraysSummary, {})).getAllByText;
        expect(getAllByText(/required-complete is required/).length).toEqual(1);
    });
});

import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import TransferListing from './TransferListing';
// import { useList } from 'tapis-hooks/files/transfers';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { transferTask } from 'fixtures/files.fixtures';
jest.mock('tapis-hooks/files/transfers');
describe('Transfer Listing', function () {
    it('renders Transfer Listing component', function () {
        Hooks.Transfers.useList.mockReturnValue({
            concatenatedResults: [transferTask],
            isLoading: false,
            error: null,
        });
        var getAllByText = renderComponent(_jsx(TransferListing, {})).getAllByText;
        expect(getAllByText(/transfer-1/).length).toEqual(1);
    });
    it('performs transfer selection', function () {
        Hooks.Transfers.useList.mockReturnValue({
            concatenatedResults: [transferTask],
            isLoading: false,
            error: null,
        });
        var mockOnSelect = jest.fn();
        var getByTestId = renderComponent(_jsx(TransferListing, { onSelect: mockOnSelect })).getByTestId;
        // Find the transfer task
        var task = getByTestId(transferTask.id);
        expect(task).toBeDefined();
        // Click on the task expect the callback to have run
        task.click();
        expect(mockOnSelect).toHaveBeenLastCalledWith(transferTask);
    });
});

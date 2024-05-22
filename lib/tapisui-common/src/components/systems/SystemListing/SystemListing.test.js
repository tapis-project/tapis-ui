import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import SystemListing from './SystemListing';
import { Systems } from '@tapis/tapisui-hooks';
import { tapisSystem } from 'fixtures/systems.fixtures';
jest.mock('tapis-hooks/systems');
describe('System Listing', function () {
    it('renders System Listing component', function () {
        Systems.useList.mockReturnValue({
            data: { result: [tapisSystem] },
            isLoading: false,
            error: null,
        });
        var getAllByText = renderComponent(_jsx(SystemListing, {})).getAllByText;
        expect(getAllByText(/testuser2\.execution/).length).toEqual(1);
    });
    it('performs system selection', function () {
        Systems.useList.mockReturnValue({
            data: { result: [tapisSystem] },
            isLoading: false,
            error: null,
        });
        var mockOnSelect = jest.fn();
        var getByTestId = renderComponent(_jsx(SystemListing, { onSelect: mockOnSelect })).getByTestId;
        // Find the file1.txt and file2.txt rows
        var system = getByTestId('testuser2.execution');
        expect(system).toBeDefined();
        // Click on file1.txt and expect the callback to have run
        system.click();
        expect(mockOnSelect).toHaveBeenLastCalledWith(tapisSystem);
    });
    it('performs system navigation', function () {
        Systems.useList.mockReturnValue({
            data: { result: [tapisSystem] },
            isLoading: false,
            error: null,
        });
        var mockOnNavigate = jest.fn();
        var getByTestId = renderComponent(_jsx(SystemListing, { onNavigate: mockOnNavigate })).getByTestId;
        // Find the file1.txt and file2.txt rows
        var system = getByTestId('href-testuser2.execution');
        expect(system).toBeDefined();
        // Click on file1.txt and expect the callback to have run
        system.click();
        expect(mockOnNavigate).toHaveBeenLastCalledWith(tapisSystem);
    });
});

var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import FileListing from './FileListing';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { fileInfo } from 'fixtures/files.fixtures';
jest.mock('tapis-hooks/files');
describe('Files', function () {
    it('renders File Listing component', function () {
        Hooks.useList.mockReturnValue({
            concatenatedResults: [fileInfo],
            isLoading: false,
            error: null,
        });
        var getAllByText = renderComponent(_jsx(FileListing, { systemId: 'system', path: '/' })).getAllByText;
        expect(getAllByText(/file1/).length).toEqual(1);
        expect(getAllByText(/01\/01\/2020/).length).toEqual(1);
        expect(getAllByText(/29.3 kB/).length).toEqual(1);
    });
    it('performs file selection', function () {
        Hooks.useList.mockReturnValue({
            concatenatedResults: [__assign({}, fileInfo)],
            isLoading: false,
            error: null,
        });
        var mockOnSelect = jest.fn();
        var getByTestId = renderComponent(_jsx(FileListing, { systemId: 'system', path: '/', selectMode: { mode: 'single', types: ['dir', 'file'] }, onSelect: mockOnSelect })).getByTestId;
        // Find the file1.txt and file2.txt rows
        var file1 = getByTestId('file1.txt');
        expect(file1).toBeDefined();
        // Click on file1.txt and expect the select callback to have run
        file1.click();
        expect(mockOnSelect).toHaveBeenLastCalledWith([fileInfo]);
    });
    it('performs file unselection', function () {
        Hooks.useList.mockReturnValue({
            concatenatedResults: [__assign({}, fileInfo)],
            isLoading: false,
            error: null,
        });
        var mockOnUnselect = jest.fn();
        var getByTestId = renderComponent(_jsx(FileListing, { systemId: 'system', path: '/', selectMode: { mode: 'single', types: ['dir', 'file'] }, selectedFiles: [fileInfo], onUnselect: mockOnUnselect })).getByTestId;
        // Find the file1.txt and file2.txt rows
        var file1 = getByTestId('file1.txt');
        expect(file1).toBeDefined();
        // Click on file1.txt and expect the unselect callback to have run
        file1.click();
        expect(mockOnUnselect).toHaveBeenLastCalledWith([fileInfo]);
    });
    it('performs select all', function () {
        var concatenatedResults = [
            __assign({}, fileInfo),
            __assign(__assign({}, fileInfo), { name: 'file2.txt' }),
        ];
        Hooks.useList.mockReturnValue({
            concatenatedResults: concatenatedResults,
            isLoading: false,
            error: null,
        });
        var mockOnSelect = jest.fn();
        var mockOnUnselect = jest.fn();
        var getByTestId = renderComponent(_jsx(FileListing, { systemId: 'system', path: '/', selectMode: { mode: 'multi', types: ['dir', 'file'] }, selectedFiles: [fileInfo], onSelect: mockOnSelect, onUnselect: mockOnUnselect })).getByTestId;
        // Find the file1.txt and file2.txt rows
        var selectAll = getByTestId('select-all');
        expect(selectAll).toBeDefined();
        // Click on file1.txt and expect the unselect callback to have run
        selectAll.click();
        expect(mockOnSelect).toHaveBeenCalledWith(concatenatedResults);
        selectAll.click();
        expect(mockOnUnselect).toHaveBeenCalledWith(concatenatedResults);
    });
});

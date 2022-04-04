import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import FileListing from './FileListing';
import { useList } from 'tapis-hooks/files';
import { fileInfo } from 'fixtures/files.fixtures';
import { Files } from '@tapis/tapis-typescript';

jest.mock('tapis-hooks/files');

describe('Files', () => {
  it('renders File Listing component', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [fileInfo],
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(
      <FileListing systemId={'system'} path={'/'} />
    );
    expect(getAllByText(/file1/).length).toEqual(1);
    expect(getAllByText(/01\/01\/2020/).length).toEqual(1);
    expect(getAllByText(/29.3 kB/).length).toEqual(1);
  });

  it('performs file selection', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [{ ...fileInfo }],
      isLoading: false,
      error: null,
    });
    const mockOnSelect = jest.fn();
    const { getByTestId } = renderComponent(
      <FileListing
        systemId={'system'}
        path={'/'}
        selectMode={{ mode: 'single', types: ['dir', 'file'] }}
        onSelect={mockOnSelect}
      />
    );
    // Find the file1.txt and file2.txt rows
    const file1 = getByTestId('file1.txt');
    expect(file1).toBeDefined();

    // Click on file1.txt and expect the select callback to have run
    file1.click();
    expect(mockOnSelect).toHaveBeenLastCalledWith([fileInfo]);
  });

  it('performs file unselection', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [{ ...fileInfo }],
      isLoading: false,
      error: null,
    });
    const mockOnUnselect = jest.fn();
    const { getByTestId } = renderComponent(
      <FileListing
        systemId={'system'}
        path={'/'}
        selectMode={{ mode: 'single', types: ['dir', 'file'] }}
        selectedFiles={[fileInfo]}
        onUnselect={mockOnUnselect}
      />
    );
    // Find the file1.txt and file2.txt rows
    const file1 = getByTestId('file1.txt');
    expect(file1).toBeDefined();

    // Click on file1.txt and expect the unselect callback to have run
    file1.click();
    expect(mockOnUnselect).toHaveBeenLastCalledWith([fileInfo]);
  });

  it('performs select all', () => {
    const concatenatedResults: Array<Files.FileInfo> = [
      { ...fileInfo },
      { ...fileInfo, name: 'file2.txt' },
    ];
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults,
      isLoading: false,
      error: null,
    });
    const mockOnSelect = jest.fn();
    const mockOnUnselect = jest.fn();
    const { getByTestId } = renderComponent(
      <FileListing
        systemId={'system'}
        path={'/'}
        selectMode={{ mode: 'multi', types: ['dir', 'file'] }}
        selectedFiles={[fileInfo]}
        onSelect={mockOnSelect}
        onUnselect={mockOnUnselect}
      />
    );
    // Find the file1.txt and file2.txt rows
    const selectAll = getByTestId('select-all');
    expect(selectAll).toBeDefined();

    // Click on file1.txt and expect the unselect callback to have run
    selectAll.click();
    expect(mockOnSelect).toHaveBeenCalledWith(concatenatedResults);

    selectAll.click();
    expect(mockOnUnselect).toHaveBeenCalledWith(concatenatedResults);
  });
});

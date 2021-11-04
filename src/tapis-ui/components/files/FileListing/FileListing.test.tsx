import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import FileListing from './FileListing';
import { useList } from 'tapis-hooks/files';
import { fileInfo } from 'fixtures/files.fixtures';

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
      concatenatedResults: [
        { ...fileInfo }
      ],
      isLoading: false,
      error: null,
    });
    const mockOnSelect = jest.fn();
    const { getByTestId } = renderComponent(
      <FileListing
        systemId={'system'}
        path={'/'}
        selectTypes={['dir', 'file']}
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
      concatenatedResults: [
        { ...fileInfo }
      ],
      isLoading: false,
      error: null,
    });
    const mockOnUnselect = jest.fn();
    const { getByTestId } = renderComponent(
      <FileListing
        systemId={'system'}
        path={'/'}
        selectTypes={['dir', 'file']}
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

/*
  it('performs multiple file selection', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [
        { ...fileInfo },
        { ...fileInfo, name: 'file2.txt' },
      ],
      isLoading: false,
      error: null,
    });
    const spy = jest.fn();
    const { getByTestId } = renderComponent(
      <FileListing
        systemId={'system'}
        path={'/'}
        select={{ mode: 'multi' }}
        onSelect={spy}
      />
    );
    // Find the file1.txt and file2.txt rows
    const file1 = getByTestId('file1.txt');
    const file2 = getByTestId('file2.txt');
    expect(file1).toBeDefined();
    expect(file2).toBeDefined();

    // Click on file1.txt and expect the callback to have run
    file1.click();
    expect(spy).toHaveBeenLastCalledWith([{ ...fileInfo }]);

    // Click on file2.txt and expect the callback to have been called with both items
    file2.click();
    expect(spy).toHaveBeenLastCalledWith([
      { ...fileInfo },
      { ...fileInfo, name: 'file2.txt' },
    ]);

    // Click on file1.txt again and expect the file to be "unselected"
    file1.click();
    expect(spy).toHaveBeenLastCalledWith([{ ...fileInfo, name: 'file2.txt' }]);
  });

  it('performs single file selection', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [
        { ...fileInfo },
        { ...fileInfo, name: 'file2.txt' },
      ],
      isLoading: false,
      error: null,
    });
    const spy = jest.fn();
    const { getByTestId } = renderComponent(
      <FileListing
        systemId={'system'}
        path={'/'}
        select={{ mode: 'single', types: ['file'] }}
        onSelect={spy}
      />
    );

    // Find the file1.txt and file2.txt rows
    const file1 = getByTestId('file1.txt');
    const file2 = getByTestId('file2.txt');
    expect(file1).toBeDefined();
    expect(file2).toBeDefined();

    // Click on file1.txt and expect the callback to have run
    file1.click();
    expect(spy).toHaveBeenLastCalledWith([{ ...fileInfo }]);

    // Click on file2.txt and expect the callback to have been called with both items
    file2.click();
    expect(spy).toHaveBeenLastCalledWith([{ ...fileInfo, name: 'file2.txt' }]);
  });

  it('should not allow selection of invalid file types', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [
        { ...fileInfo },
        { ...fileInfo, type: 'dir', name: 'dir1' },
      ],
      isLoading: false,
      error: null,
    });
    const spy = jest.fn();

    // Create a FilesListing that disallows selection of any type
    const { getByTestId } = renderComponent(
      <FileListing
        systemId={'system'}
        path={'/'}
        select={{ mode: 'single', types: [] }}
        onSelect={spy}
      />
    );
    const file1 = getByTestId('file1.txt');
    const dir1 = getByTestId('dir1');
    expect(file1).toBeDefined();
    expect(dir1).toBeDefined();

    // The only callback should be the initial render when trying to click a disallowed type
    file1.click();
    expect(spy).toHaveBeenCalledTimes(1);

    dir1.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should not allow selection of files if select is undefined', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [
        { ...fileInfo },
        { ...fileInfo, type: 'dir', name: 'dir1' },
      ],
      isLoading: false,
      error: null,
    });
    const spy = jest.fn();

    // Create a FilesListing that disallows selection of any type
    const { getByTestId } = renderComponent(
      <FileListing systemId={'system'} path={'/'} onSelect={spy} />
    );
    const file1 = getByTestId('file1.txt');
    const dir1 = getByTestId('dir1');
    expect(file1).toBeDefined();
    expect(dir1).toBeDefined();

    // The only callback should be the initial render
    file1.click();
    expect(spy).toHaveBeenCalledTimes(1);
    dir1.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });
  */
});

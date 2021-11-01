import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import FileExplorer from './FileExplorer';
import { useList as useSystemsList } from 'tapis-hooks/systems';
import { useList as useFilesList } from 'tapis-hooks/files';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { fileInfo } from 'fixtures/files.fixtures';

jest.mock('tapis-hooks/systems');

describe('File Explorer', () => {
  it('renders File Explorer component', () => {
    (useSystemsList as jest.Mock).mockReturnValue({
      data: { result: [tapisSystem] },
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(<FileExplorer />);
    expect(getAllByText(/testuser8-e2e/).length).toEqual(1);
  });
  it('renders performs a file listing upon system selection', () => {
    (useSystemsList as jest.Mock).mockReturnValue({
      data: { result: [tapisSystem] },
      isLoading: false,
      error: null,
    });
    (useFilesList as jest.Mock).mockReturnValue({
      concatenatedResults: [
        { ...fileInfo },
        { ...fileInfo, type: 'dir', name: 'dir1' },
      ],
      isLoading: false,
      error: null,
    });
    
  });
/*
  it('performs system selection', () => {
    (useList as jest.Mock).mockReturnValue({
      data: { result: [tapisSystem] },
      isLoading: false,
      error: null,
    });
    const mockOnSelect = jest.fn();
    const { getByTestId } = renderComponent(
      <SystemListing onSelect={mockOnSelect} />
    );
    // Find the file1.txt and file2.txt rows
    const system = getByTestId('testuser8-e2e');
    expect(system).toBeDefined();

    // Click on file1.txt and expect the callback to have run
    system.click();
    expect(mockOnSelect).toHaveBeenLastCalledWith(tapisSystem);
  });

  it('performs system navigation', () => {
    (useList as jest.Mock).mockReturnValue({
      data: { result: [tapisSystem] },
      isLoading: false,
      error: null,
    });
    const mockOnNavigate = jest.fn();
    const { getByTestId } = renderComponent(
      <SystemListing onNavigate={mockOnNavigate} />
    );
    // Find the file1.txt and file2.txt rows
    const system = getByTestId('href-testuser8-e2e');
    expect(system).toBeDefined();

    // Click on file1.txt and expect the callback to have run
    system.click();
    expect(mockOnNavigate).toHaveBeenLastCalledWith(tapisSystem);
  });
  */
});

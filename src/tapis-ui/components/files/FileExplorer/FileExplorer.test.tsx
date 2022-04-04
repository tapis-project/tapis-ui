import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { act, fireEvent } from '@testing-library/react';
import renderComponent from 'utils/testing';
import FileExplorer from './FileExplorer';
import { useList as useSystemsList } from 'tapis-hooks/systems';
import { useList as useFilesList } from 'tapis-hooks/files';
import { tapisSystem } from 'fixtures/systems.fixtures';
import { fileInfo } from 'fixtures/files.fixtures';

jest.mock('tapis-hooks/systems');
jest.mock('tapis-hooks/files');

describe('File Explorer', () => {
  it('renders File Explorer component', () => {
    (useSystemsList as jest.Mock).mockReturnValue({
      data: { result: [tapisSystem] },
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(
      <FileExplorer allowSystemChange={true} />
    );
    expect(getAllByText(/testuser2\.execution/).length).toEqual(1);
  });
  it('performs system navigation', async () => {
    const mockOnNavigate = jest.fn();
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
    const { getByTestId } = renderComponent(
      <FileExplorer allowSystemChange={true} onNavigate={mockOnNavigate} />
    );
    const system = getByTestId('href-testuser2.execution');
    await act(async () => {
      fireEvent.click(system);
    });
    expect(mockOnNavigate).toBeCalledWith('testuser2.execution', '/');
  });
});

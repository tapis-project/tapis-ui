import { act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import FileSelectModal from './FileSelectModal';
import { useList } from 'tapis-hooks/files';
import { fileInfo } from 'fixtures/files.fixtures';

jest.mock('tapis-hooks/files');

describe('File Select Modal', () => {
  it('renders File Select Modal component', () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [fileInfo],
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(
      <FileSelectModal systemId={'system'} path={'/'} toggle={jest.fn()} />
    );
    expect(getAllByText(/file1/).length).toEqual(1);
    expect(getAllByText(/01\/01\/2020/).length).toEqual(1);
    expect(getAllByText(/29.3 kB/).length).toEqual(1);
  });

  it('performs file selection', async () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [{ ...fileInfo }],
      isLoading: false,
      error: null,
    });
    const mockOnSelect = jest.fn();
    const { getByTestId } = renderComponent(
      <FileSelectModal
        systemId={'system'}
        path={'/'}
        toggle={jest.fn()}
        onSelect={mockOnSelect}
      />
    );
    // Find the file1.txt and file2.txt rows
    const file1 = getByTestId('file1.txt');
    expect(file1).toBeDefined();

    // Click on file1.txt
    await act(async () => {
      fireEvent.click(file1);
    });

    const select = getByTestId('modalSelect');
    expect(select).toBeDefined();

    await act(async () => {
      fireEvent.click(select);
    });

    expect(mockOnSelect).toHaveBeenCalledWith('system', [{ ...fileInfo }]);
  });
});

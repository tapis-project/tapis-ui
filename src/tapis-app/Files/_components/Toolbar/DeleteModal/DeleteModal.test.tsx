import { act, fireEvent, screen } from '@testing-library/react';
import renderComponent from 'utils/testing';
import DeleteModal from './DeleteModal';
import { useDelete } from 'tapis-hooks/files';
import { useMutations } from 'tapis-hooks/utils';
import { fileInfo } from 'fixtures/files.fixtures';
import { useFilesSelect } from 'tapis-app/Files/_components/FilesContext';

jest.mock('tapis-hooks/utils');
jest.mock('tapis-hooks/files');
jest.mock('tapis-app/Files/_components/FilesContext');

describe('DeleteModal', () => {
  it('performs delete operations', async () => {
    const mockRun = jest.fn();
    (useMutations as jest.Mock).mockReturnValue({
      run: mockRun,
    });

    const mockDeleteFileAsync = jest.fn();
    const mockReset = jest.fn();
    (useDelete as jest.Mock).mockReturnValue({
      deleteFileAsync: mockDeleteFileAsync,
      reset: mockReset,
      error: null,
      isSuccess: false,
      isLoading: false,
    });

    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });

    renderComponent(
      <DeleteModal toggle={() => {}} systemId={'system-id'} path={'/'} />
    );

    const button = screen.getByLabelText('Submit');
    await act(async () => {
      fireEvent.click(button);
    });

    expect((useMutations as jest.Mock).mock.calls[0][0].fn).toEqual(
      mockDeleteFileAsync
    );
    expect(mockRun.mock.calls[0][0][0].path).toEqual('/file1.txt');
  });
});

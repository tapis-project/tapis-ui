import { act, fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import DeleteModal from './DeleteModal';
import { Files as Hooks, utils } from '@tapis/tapisui-hooks';
import { fileInfo } from 'fixtures/files.fixtures';
import { useFilesSelect } from 'app/Files/_components/FilesContext';

jest.mock('@tapis/tapisui-hooks');
jest.mock('app/Files/_components/FilesContext');

describe('DeleteModal', () => {
  it('performs delete operations', async () => {
    const mockRun = jest.fn();
    (utils.useMutations as jest.Mock).mockReturnValue({
      run: mockRun,
    });

    const mockDeleteFileAsync = jest.fn();
    const mockReset = jest.fn();
    (Hooks.useDelete as jest.Mock).mockReturnValue({
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

    expect((utils.useMutations as jest.Mock).mock.calls[0][0].fn).toEqual(
      mockDeleteFileAsync
    );
    expect(mockRun.mock.calls[0][0][0].path).toEqual('/file1.txt');
  });
});

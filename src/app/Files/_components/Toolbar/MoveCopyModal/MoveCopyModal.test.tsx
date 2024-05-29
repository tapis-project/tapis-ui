import { act, fireEvent, screen } from '@testing-library/react';
import renderComponent from 'testing/utils';
import MoveCopyModal from './MoveCopyModal';
import { Files as Hooks, utils } from '@tapis/tapisui-hooks';
import { fileInfo } from 'fixtures/files.fixtures';
import { Files } from '@tapis/tapis-typescript';
import { useFilesSelect } from 'app/Files/_components/FilesContext';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@tapis/tapisui-hooks');
jest.mock('app/Files/_components/FilesContext');

describe('MoveCopyModal', () => {
  it('performs copy operations', async () => {
    (Hooks.useList as jest.Mock).mockReturnValue({
      concatenatedResults: [{ ...fileInfo, type: 'dir' }],
      isLoading: false,
      error: null,
    });

    const mockRun = jest.fn();
    (utils.useMutations as jest.Mock).mockReturnValue({
      run: mockRun,
      isRunning: false,
      isFinished: false,
    });
    const mockCopyAsync = jest.fn();
    (Hooks.useCopy as jest.Mock).mockReturnValue({
      copyAsync: mockCopyAsync,
    });
    const mockMoveAsync = jest.fn();
    (Hooks.useMove as jest.Mock).mockReturnValue({
      moveAsync: mockMoveAsync,
    });

    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });

    renderComponent(
      <MoveCopyModal
        toggle={() => {}}
        systemId={'system-id'}
        path={'/'}
        operation={Files.MoveCopyRequestOperationEnum.Copy}
      />
    );

    // Change directory to target destination
    const link = screen.getByTestId(`btn-link-${fileInfo.name!}`);
    await act(async () => {
      fireEvent.click(link);
    });

    const button = screen.getByLabelText('Submit');
    await act(async () => {
      fireEvent.click(button);
    });

    expect((utils.useMutations as jest.Mock).mock.calls[0][0].fn).toEqual(
      mockCopyAsync
    );
    expect(mockRun.mock.calls[0][0][0].path).toEqual('/file1.txt');
  });
  it('performs move operations', async () => {
    (Hooks.useList as jest.Mock).mockReturnValue({
      concatenatedResults: [{ ...fileInfo, type: 'dir' }],
      isLoading: false,
      error: null,
    });

    const mockRun = jest.fn();
    (utils.useMutations as jest.Mock).mockReturnValue({
      run: mockRun,
      isRunning: false,
      isFinished: false,
    });
    const mockCopyAsync = jest.fn();
    (Hooks.useCopy as jest.Mock).mockReturnValue({
      copyAsync: mockCopyAsync,
    });
    const mockMoveAsync = jest.fn();
    (Hooks.useMove as jest.Mock).mockReturnValue({
      moveAsync: mockMoveAsync,
    });

    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });

    renderComponent(
      <MoveCopyModal
        toggle={() => {}}
        systemId={'system-id'}
        path={'/'}
        operation={Files.MoveCopyRequestOperationEnum.Move}
      />
    );

    // Change directory to target destination
    const link = screen.getByTestId(`btn-link-${fileInfo.name!}`);
    await act(async () => {
      fireEvent.click(link);
    });

    const button = screen.getByLabelText('Submit');
    await act(async () => {
      fireEvent.click(button);
    });

    expect((utils.useMutations as jest.Mock).mock.calls[0][0].fn).toEqual(
      mockMoveAsync
    );
    expect(mockRun.mock.calls[0][0][0].path).toEqual('/file1.txt');
  });
});

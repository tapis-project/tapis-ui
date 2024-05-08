import { act, fireEvent, screen } from '@testing-library/react';
import renderComponent from 'utils/testing';
import MoveCopyModal from './MoveCopyModal';
import { useCopy, useMove, useList } from 'tapis-hooks/files';
import { useMutations } from 'tapis-hooks/utils';
import { fileInfo } from 'fixtures/files.fixtures';
import { Files } from '@tapis/tapis-typescript';
import { useFilesSelect } from 'tapis-app/Files/_components/FilesContext';
import '@testing-library/jest-dom/extend-expect';

jest.mock('tapis-hooks/utils');
jest.mock('tapis-hooks/files');
jest.mock('tapis-app/Files/_components/FilesContext');

describe('MoveCopyModal', () => {
  it('performs copy operations', async () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [{ ...fileInfo, type: 'dir' }],
      isLoading: false,
      error: null,
    });

    const mockRun = jest.fn();
    (useMutations as jest.Mock).mockReturnValue({
      run: mockRun,
      isRunning: false,
      isFinished: false,
    });
    const mockCopyAsync = jest.fn();
    (useCopy as jest.Mock).mockReturnValue({
      copyAsync: mockCopyAsync,
    });
    const mockMoveAsync = jest.fn();
    (useMove as jest.Mock).mockReturnValue({
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

    expect((useMutations as jest.Mock).mock.calls[0][0].fn).toEqual(
      mockCopyAsync
    );
    expect(mockRun.mock.calls[0][0][0].path).toEqual('/file1.txt');
  });
  it('performs move operations', async () => {
    (useList as jest.Mock).mockReturnValue({
      concatenatedResults: [{ ...fileInfo, type: 'dir' }],
      isLoading: false,
      error: null,
    });

    const mockRun = jest.fn();
    (useMutations as jest.Mock).mockReturnValue({
      run: mockRun,
      isRunning: false,
      isFinished: false,
    });
    const mockCopyAsync = jest.fn();
    (useCopy as jest.Mock).mockReturnValue({
      copyAsync: mockCopyAsync,
    });
    const mockMoveAsync = jest.fn();
    (useMove as jest.Mock).mockReturnValue({
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

    const mutation = useMutations as jest.Mock;
    // expect(mutation.mock.calls[0][0].fn).toEqual(mockMoveAsync);
    // expect((useMutations as jest.Mock).mock.calls[0][0].fn).toEqual(
    //   mockMoveAsync
    // );
    expect(mockRun.mock.calls[0][0][0].path).toEqual('/file1.txt');
  });
});

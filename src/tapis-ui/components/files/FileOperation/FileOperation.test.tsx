import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'utils/testing';
import FileOperation from './FileOperation';
import { useNativeOp } from 'tapis-hooks/files';
import { Files } from '@tapis/tapis-typescript';

jest.mock('tapis-hooks/files');

describe('FileOperation', () => {
  it('submits with valid inputs', async () => {
    const nativeOpMock = jest.fn();
    const resetMock = jest.fn();
    (useNativeOp as jest.Mock).mockReturnValue({
      nativeOp: nativeOpMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: resetMock,
    });

    renderComponent(
      <FileOperation systemId={'mockSystem'} path={'/file1.txt'} />
    );

    const input = screen.getByLabelText('Arguments');
    await act(async () => {
      fireEvent.change(input, {
        target: {
          value: '600',
        },
      });
    });

    const check = screen.getByLabelText('Recursive');
    await act(async () => {
      fireEvent.click(check);
    });

    const button = screen.getByLabelText('Submit');
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      const callParams = nativeOpMock.mock.calls[0];
      expect(callParams[0]).toEqual({
        systemId: 'mockSystem',
        path: '/file1.txt',
        recursive: true,
        operation: Files.NativeLinuxOpRequestOperationEnum.Chmod,
        argument: '600',
      });
      expect(resetMock).toBeCalledTimes(1);
    });
  });
});

import { act, screen } from '@testing-library/react';
import renderComponent from 'utils/testing';
import TransferCancel from './TransferCancel';
import { useDetails, useCancel } from 'tapis-hooks/files/transfers';
import { Files } from '@tapis/tapis-typescript';
import { transferTask } from 'fixtures/files.fixtures';
import '@testing-library/jest-dom/extend-expect';

jest.mock('tapis-hooks/files/transfers');

describe('TransferCancel', () => {
  it('displays a task that is not cancelable', () => {
    const cancelMock = jest.fn();
    const resetMock = jest.fn();
    (useCancel as jest.Mock).mockReturnValue({
      cancel: cancelMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: resetMock,
    });
    (useDetails as jest.Mock).mockReturnValue({
      data: {
        result: transferTask,
      },
      isLoading: false,
      error: null,
    });

    renderComponent(<TransferCancel transferTaskId={transferTask.uuid!} />);

    const cancel = screen.getByLabelText('Cancel');
    expect(cancel).toHaveAttribute('disabled');
    expect(resetMock).toBeCalledTimes(1);
  });
  it('displays cancels a task', async () => {
    const cancelMock = jest.fn();
    const resetMock = jest.fn();
    (useCancel as jest.Mock).mockReturnValue({
      cancel: cancelMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: resetMock,
    });
    (useDetails as jest.Mock).mockReturnValue({
      data: {
        result: {
          ...transferTask,
          status: Files.TransferTaskStatusEnum.InProgress,
        },
      },
      isLoading: false,
      error: null,
    });

    renderComponent(<TransferCancel transferTaskId={transferTask.uuid!} />);

    const cancel = screen.getByLabelText('Cancel');
    expect(cancel).not.toHaveAttribute('disabled');
    await act(async () => {
      cancel.click();
    });
    expect(resetMock).toBeCalledTimes(1);
    const callParams = cancelMock.mock.calls[0];
    expect(callParams[0]).toEqual(transferTask.uuid!);
  });
});

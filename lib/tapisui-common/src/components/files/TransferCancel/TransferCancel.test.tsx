import { act, screen } from '@testing-library/react';
import renderComponent from '../../../testing/utils';
import TransferCancel from './TransferCancel';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Files } from '@tapis/tapis-typescript';
import { transferTask } from '../../../fixtures/files.fixtures';

jest.mock('@tapis/tapisui-hooks');

describe('TransferCancel', () => {
  it('displays a task that is not cancelable', () => {
    const cancelMock = jest.fn();
    const resetMock = jest.fn();
    (Hooks.Transfers.useCancel as jest.Mock).mockReturnValue({
      cancel: cancelMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: resetMock,
    });
    (Hooks.Transfers.useDetails as jest.Mock).mockReturnValue({
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
    (Hooks.Transfers.useCancel as jest.Mock).mockReturnValue({
      cancel: cancelMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: resetMock,
    });
    (Hooks.Transfers.useDetails as jest.Mock).mockReturnValue({
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

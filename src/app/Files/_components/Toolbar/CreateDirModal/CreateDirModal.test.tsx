import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import CreateDirModal from './CreateDirModal';
import { Files as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('CreateDirModal', () => {
  it('fires the onSubmit function', async () => {
    const mkdirMock = jest.fn();
    const resetMock = jest.fn();
    (Hooks.useMkdir as jest.Mock).mockReturnValue({
      mkdir: mkdirMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: resetMock,
    });

    renderComponent(<CreateDirModal toggle={() => {}} />);

    const input = screen.getByLabelText('Input');
    await act(async () => {
      fireEvent.change(input, {
        target: {
          value: 'testdir',
        },
      });
    });

    const button = screen.getByLabelText('Submit');
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mkdirMock).toBeCalledTimes(1);
      expect(resetMock).toBeCalledTimes(1);
    });
  });

  it('submits with valid inputs', async () => {
    const mkdirMock = jest.fn();
    const resetMock = jest.fn();
    (Hooks.useMkdir as jest.Mock).mockReturnValue({
      mkdir: mkdirMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: resetMock,
    });

    renderComponent(<CreateDirModal toggle={() => {}} />);

    const input = screen.getByLabelText('Input');
    await act(async () => {
      fireEvent.change(input, {
        target: {
          value: 'testdir',
        },
      });
    });

    const button = screen.getByLabelText('Submit');
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mkdirMock).toBeCalledTimes(1);
      expect(resetMock).toBeCalledTimes(1);
    });
  });

  it('fails with invalid inputs', async () => {
    const mkdirMock = jest.fn();
    const resetMock = jest.fn();
    (Hooks.useMkdir as jest.Mock).mockReturnValue({
      mkdir: mkdirMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: resetMock,
    });

    renderComponent(<CreateDirModal toggle={() => {}} />);

    const input = screen.getByLabelText('Input');
    await act(async () => {
      fireEvent.change(input, {
        target: {
          // * is an invalid value
          value: '*',
        },
      });
    });

    const button = screen.getByLabelText('Submit');
    await act(async () => {
      fireEvent.click(button);
    });

    await waitFor(() => {
      expect(mkdirMock).toBeCalledTimes(0);
      expect(resetMock).toBeCalledTimes(1);
    });
  });
});

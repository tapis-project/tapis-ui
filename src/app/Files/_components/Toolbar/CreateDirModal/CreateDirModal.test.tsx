import { act, fireEvent, screen, waitFor } from '@testing-library/react';
import renderComponent from 'testing/utils';
import CreateDirModal from './CreateDirModal';
import { Files as Hooks } from '@tapis/tapisui-hooks';

jest.mock('@tapis/tapisui-hooks');

describe('refreshing the listing afterwards', () => {
  it('invalidates this system rather than faking a window focus', async () => {
    // The old shape called focusManager.setFocused(true) — refreshing by
    // pretending the window had been focused, which re-ran EVERY
    // focus-refetching query in the app and only worked while the file
    // listing left focus refetching on. It says what it means now.
    const invalidate = jest.fn();
    const mkdirMock = jest.fn();
    (Hooks.useInvalidateFiles as jest.Mock).mockReturnValue(invalidate);
    (Hooks.useMkdir as jest.Mock).mockReturnValue({
      mkdir: mkdirMock,
      isLoading: false,
      error: null,
      isSuccess: false,
      reset: jest.fn(),
    });

    renderComponent(<CreateDirModal toggle={() => {}} systemId="frontera" />);
    await act(async () => {
      fireEvent.change(screen.getByLabelText('Input'), {
        target: { value: 'testdir' },
      });
    });
    await act(async () => {
      fireEvent.click(screen.getByLabelText('Submit'));
    });

    // the modal hands mkdir an onSuccess; run it the way react-query would
    await waitFor(() => expect(mkdirMock).toHaveBeenCalled());
    const options = mkdirMock.mock.calls[0][2];
    act(() => options.onSuccess());

    // scoped to the system whose directory just changed, not everything
    expect(invalidate).toHaveBeenCalledWith('frontera');
  });
});

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
      expect(mkdirMock).toHaveBeenCalledTimes(1);
      expect(resetMock).toHaveBeenCalledTimes(1);
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
      expect(mkdirMock).toHaveBeenCalledTimes(1);
      expect(resetMock).toHaveBeenCalledTimes(1);
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
      expect(mkdirMock).toHaveBeenCalledTimes(0);
      expect(resetMock).toHaveBeenCalledTimes(1);
    });
  });
});

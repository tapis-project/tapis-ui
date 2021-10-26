import { fireEvent, screen } from '@testing-library/react';
import renderComponent from 'utils/testing';
import CreateDirModal from './CreateDirModal'
import { useMkdir } from 'tapis-hooks/files'

jest.mock("tapis-hooks/files/useMkdir")

describe('CreateDirModal', () => {
  it('renders CreateDirModal with form that submits', () => {
    const mkdirMock = jest.fn();
    const resetMock = jest.fn();
    (useMkdir as jest.Mock).mockReturnValue({
      mkdir: mkdirMock,
      isLoading: false,
      error: null,
      isSuccess: true,
      reset: resetMock
    });

    const { getByLabelText } = renderComponent(
      <CreateDirModal
        toggle={() => {}}
      />
    );

    const button = getByLabelText("Submit");
    const input = getByLabelText("Input")

    fireEvent.input(input, {
      target: {
        value: "*"
      }
    });

    fireEvent.submit(button);

    expect(mkdirMock).toBeCalledTimes(1)
    expect(resetMock).toBeCalledTimes(1)
  });
});

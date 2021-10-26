import { act, fireEvent, screen } from '@testing-library/react';
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
      isSuccess: false,
      reset: resetMock
    });

    renderComponent(
      <CreateDirModal
        toggle={() => {}}
      />
    );

    const button = screen.getByLabelText("Submit");
    const input = screen.getByLabelText("Input")

    expect(button).toBeInTheDocument()
    expect(input).toBeInTheDocument()

    fireEvent.input(input, {
      target: {
        value: "test"
      }
    });

    console.log("Input: ", input)
    
    fireEvent.submit(button);
    console.log("Button after click: ", button)

    // expect(mkdirMock).toBeCalledTimes(1)
    // expect(resetMock).toBeCalledTimes(1)
  });
});

import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import GenericModal from './GenericModal';

jest.mock('tapis-hooks/systems');

describe('GenericModal', () => {
  it('renders GenericModal component with correct text and toggle function', () => {
    const mockToggle = jest.fn();
    const { getAllByText, getByLabelText } = renderComponent(
      <GenericModal
        toggle={mockToggle}
        title="Generic Title"
        body="Text in body"
      />
    );
    expect(getAllByText(/Generic Title/).length).toEqual(1);
    expect(getAllByText(/Text in body/).length).toEqual(1);

    const closeButton = getByLabelText('Close');
    closeButton.click();

    expect(mockToggle).toBeCalledTimes(1);
  });

  it("Doesn't render GenericModal if isOpen set to false", () => {
    const { queryAllByText } = renderComponent(
      <GenericModal
        toggle={() => {}}
        title="Generic Title"
        body="Text in body"
      />
    );

    expect(queryAllByText(/Generic Title/).length).toEqual(0);
    expect(queryAllByText(/Text in body/).length).toEqual(0);
  });
});

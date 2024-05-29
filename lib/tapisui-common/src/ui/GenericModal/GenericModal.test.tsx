import { expect, describe, it, jest } from '@jest/globals';
import renderComponent from '../../testing/utils';
import GenericModal from './GenericModal';

jest.mock('@tapis/tapisui-hooks');

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
});

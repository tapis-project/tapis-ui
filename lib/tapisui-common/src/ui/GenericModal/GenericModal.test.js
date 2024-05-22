import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import GenericModal from './GenericModal';
jest.mock('tapis-hooks/systems');
describe('GenericModal', function () {
    it('renders GenericModal component with correct text and toggle function', function () {
        var mockToggle = jest.fn();
        var _a = renderComponent(_jsx(GenericModal, { toggle: mockToggle, title: "Generic Title", body: "Text in body" })), getAllByText = _a.getAllByText, getByLabelText = _a.getByLabelText;
        expect(getAllByText(/Generic Title/).length).toEqual(1);
        expect(getAllByText(/Text in body/).length).toEqual(1);
        var closeButton = getByLabelText('Close');
        closeButton.click();
        expect(mockToggle).toBeCalledTimes(1);
    });
});

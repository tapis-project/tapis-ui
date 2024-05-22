import { jsx as _jsx } from "react/jsx-runtime";
import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import FileStat from './FileStat';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { fileStatInfo } from 'fixtures/files.fixtures';
jest.mock('tapis-hooks/files');
describe('Files', function () {
    it('renders File Listing component', function () {
        Hooks.useStat.mockReturnValue({
            data: {
                result: fileStatInfo,
            },
            isLoading: false,
            error: null,
        });
        var getAllByText = renderComponent(_jsx(FileStat, { systemId: 'system', path: '/file1.txt' })).getAllByText;
        expect(Hooks.useStat).toHaveBeenCalledWith({
            systemId: 'system',
            path: '/file1.txt',
        });
        expect(getAllByText('gid').length).toEqual(1);
    });
});

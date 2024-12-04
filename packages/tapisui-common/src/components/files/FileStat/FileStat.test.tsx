import '@testing-library/jest-dom/extend-expect';
import renderComponent from '../../../testing/utils';
import FileStat from './FileStat';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { fileStatInfo } from '../../../fixtures/files.fixtures';

jest.mock('@tapis/tapisui-hooks');

describe('Files', () => {
  it('renders File Listing component', () => {
    (Hooks.useStat as jest.Mock).mockReturnValue({
      data: {
        result: fileStatInfo,
      },
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(
      <FileStat systemId={'system'} path={'/file1.txt'} />
    );
    expect(Hooks.useStat as jest.Mock).toHaveBeenCalledWith({
      systemId: 'system',
      path: '/file1.txt',
    });
    expect(getAllByText('gid').length).toEqual(1);
  });
});

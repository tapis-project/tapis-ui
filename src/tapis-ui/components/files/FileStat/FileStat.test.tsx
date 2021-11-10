import '@testing-library/jest-dom/extend-expect';
import renderComponent from 'utils/testing';
import FileStat from './FileStat';
import { useStat } from 'tapis-hooks/files';
import { fileStatInfo } from 'fixtures/files.fixtures';

jest.mock('tapis-hooks/files');

describe('Files', () => {
  it('renders File Listing component', () => {
    (useStat as jest.Mock).mockReturnValue({
      data: {
        result: fileStatInfo,
      },
      isLoading: false,
      error: null,
    });
    const { getAllByText } = renderComponent(
      <FileStat systemId={'system'} path={'/file1.txt'} />
    );
    expect(useStat as jest.Mock).toHaveBeenCalledWith({
      systemId: 'system',
      path: '/file1.txt',
    });
    expect(getAllByText('gid').length).toEqual(1);
  });
});

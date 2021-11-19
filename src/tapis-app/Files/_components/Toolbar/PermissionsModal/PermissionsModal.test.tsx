import renderComponent from 'utils/testing';
import PermissionsModal from './PermissionsModal';
import { usePermissions } from 'tapis-hooks/files';
import { fileInfo } from 'fixtures/files.fixtures';
import { useFilesSelect } from 'tapis-app/Files/_components/FilesContext';
import { FileStat, FileOperation } from 'tapis-ui/components/files';
import { Files } from '@tapis/tapis-typescript';

jest.mock('tapis-hooks/files');
jest.mock('tapis-app/Files/_components/FilesContext');
jest.mock('tapis-ui/components/files');

describe('Permissions Modal', () => {
  it('submits with valid inputs', async () => {
    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });
    (usePermissions as jest.Mock).mockReturnValue({
      data: {
        result: {
          permission: Files.FilePermissionPermissionEnum.Modify,
        },
      },
      isLoading: false,
      error: null,
    });
    (FileStat as jest.Mock).mockReturnValue(<div></div>);
    (FileOperation as jest.Mock).mockReturnValue(<div></div>);

    renderComponent(
      <PermissionsModal toggle={() => {}} systemId={'mockSystem'} path={'/'} />
    );

    expect(FileStat as jest.Mock).toHaveBeenCalled();
    expect(FileOperation as jest.Mock).toHaveBeenCalled();
  });
});

import PermissionsModal from './PermissionsModal';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { fileInfo } from 'fixtures/files.fixtures';
import { useFilesSelect } from 'app/Files/_components/FilesContext';
import { FileStat, FileOperation } from '@tapis/tapisui-common';
import { Files } from '@tapis/tapis-typescript';

jest.mock('@tapis/tapisui-hooks');
jest.mock('@tapis/tapisui-common');
jest.mock('app/Files/_components/FilesContext');

const { renderComponent } = jest.requireActual('@tapis/tapisui-common');

describe('Permissions Modal', () => {
  it('submits with valid inputs', async () => {
    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });
    (Hooks.usePermissions as jest.Mock).mockReturnValue({
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

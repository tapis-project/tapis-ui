import renderComponent from 'testing/utils';
import PermissionsModal from './PermissionsModal';
import { Files as Hooks, useTapisConfig } from '@tapis/tapisui-hooks';
import { fileInfo } from 'fixtures/files.fixtures';
import { useFilesSelect } from 'app/Files/_components/FilesContext';
import {
  FileStat,
  FileOperation,
  GenericModal,
  QueryWrapper,
  Tabs,
} from '@tapis/tapisui-common';
import { Files } from '@tapis/tapis-typescript';

jest.mock('@tapis/tapisui-hooks');
jest.mock('@tapis/tapisui-common');
jest.mock('app/Files/_components/FilesContext');

describe('Permissions Modal', () => {
  it('submits with valid inputs', async () => {
    // Make container components render their children so inner mocks get called
    (GenericModal as jest.Mock).mockImplementation(({ body }: any) => (
      <>{body}</>
    ));
    (QueryWrapper as jest.Mock).mockImplementation(({ children }: any) => (
      <>{children}</>
    ));
    (Tabs as jest.Mock).mockImplementation(({ tabs }: any) => (
      <>{Object.values(tabs)}</>
    ));
    (FileStat as jest.Mock).mockReturnValue(<div data-testid="file-stat" />);
    (FileOperation as jest.Mock).mockReturnValue(<div data-testid="file-op" />);

    (useTapisConfig as jest.Mock).mockReturnValue({
      claims: { 'tapis/username': 'testuser' },
    });
    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });
    (Hooks.usePermissions as jest.Mock).mockReturnValue({
      data: {
        result: {
          permission: Files.PermEnum.Modify,
        },
      },
      isLoading: false,
      error: null,
    });

    renderComponent(
      <PermissionsModal toggle={() => {}} systemId={'mockSystem'} path={'/'} />
    );

    expect(FileStat as jest.Mock).toHaveBeenCalled();
    expect(FileOperation as jest.Mock).toHaveBeenCalled();
  });
});

import renderComponent from 'testing/utils';
import TransferModal from './TransferModal';
import {
  TransferListing,
  TransferCreate,
  FileExplorer,
  GenericModal,
  Tabs,
  Breadcrumbs,
  breadcrumbsFromPathname,
} from '@tapis/tapisui-common';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { useFilesSelect } from 'app/Files/_components/FilesContext';
import { fileInfo } from 'fixtures/files.fixtures';

jest.mock('@tapis/tapisui-common');
jest.mock('@tapis/tapisui-hooks');
jest.mock('app/Files/_components/FilesContext');

describe('TransferModal', () => {
  it('renders the transfer modal', async () => {
    // Container components must pass through content so inner mocks get rendered
    (GenericModal as jest.Mock).mockImplementation(({ body }: any) => (
      <>{body}</>
    ));
    (Tabs as jest.Mock).mockImplementation(({ tabs }: any) => (
      <>{Object.values(tabs)}</>
    ));
    (Breadcrumbs as jest.Mock).mockReturnValue(<div />);
    (breadcrumbsFromPathname as jest.Mock).mockReturnValue([]);

    (FileExplorer as jest.Mock).mockReturnValue(<div>Mock File Explorer</div>);
    (TransferListing as jest.Mock).mockReturnValue(
      <div>Mock Transfer Listing</div>
    );
    (TransferCreate as jest.Mock).mockReturnValue(
      <div>Mock Transfer Create</div>
    );

    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });
    (Hooks.useList as jest.Mock).mockReturnValue({
      concatenatedResults: [],
      isLoading: false,
      error: null,
    });
    (Hooks.Transfers as any).useList = jest
      .fn()
      .mockReturnValue({ refetch: jest.fn() });
    (Hooks.Transfers as any).useCreate = jest.fn().mockReturnValue({
      createAsync: jest.fn(),
      isLoading: false,
      error: null,
    });

    renderComponent(
      <TransferModal toggle={() => {}} systemId={'system-id'} path={'/'} />
    );

    expect(FileExplorer).toHaveBeenCalled();
    expect(TransferListing).toHaveBeenCalled();
    expect(TransferCreate).toHaveBeenCalled();
  });
});

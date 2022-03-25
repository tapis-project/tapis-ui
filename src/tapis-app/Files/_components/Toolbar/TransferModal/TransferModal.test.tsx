import renderComponent from 'utils/testing';
import TransferModal from './TransferModal';
import { TransferListing, TransferCreate } from 'tapis-ui/components/files';
import FileExplorer from 'tapis-ui/components/files/FileExplorer/FileExplorer';
import { useFilesSelect } from 'tapis-app/Files/_components/FilesContext';
import { fileInfo } from 'fixtures/files.fixtures';

jest.mock('tapis-ui/components/files');
jest.mock('tapis-app/Files/_components/FilesContext');
jest.mock('tapis-ui/components/files/FileExplorer/FileExplorer');

describe('TransferModal', () => {
  it('renders the transfer modal', async () => {
    (FileExplorer as jest.Mock).mockReturnValue(<div>Mock File Explorer</div>);
    (TransferListing as jest.Mock).mockReturnValue(
      <div>Mock Transfer listing</div>
    );
    (TransferCreate as jest.Mock).mockReturnValue(
      <div>Mock Transfer Create</div>
    );

    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });

    renderComponent(
      <TransferModal toggle={() => {}} systemId={'system-id'} path={'/'} />
    );

    expect(FileExplorer).toHaveBeenCalled();
    expect(TransferListing).toHaveBeenCalled();
    expect(TransferCreate).toHaveBeenCalled();
  });
});

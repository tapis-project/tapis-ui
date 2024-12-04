// import renderComponent from 'testing/utils';
import TransferModal from './TransferModal';
import { TransferListing, TransferCreate } from '@tapis/tapisui-common';
import { FileExplorer } from '@tapis/tapisui-common';
import { useFilesSelect } from 'app/Files/_components/FilesContext';
import { fileInfo } from 'fixtures/files.fixtures';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@tapis/tapisui-common');
const { renderComponent } = jest.requireActual('@tapis/tapisui-common');
jest.mock('app/Files/_components/FilesContext');

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

import { act } from '@testing-library/react';
import renderComponent from 'testing/utils';
import Toolbar from './Toolbar';
import { Files } from '@tapis/tapis-typescript';
import { fileInfo } from 'fixtures/files.fixtures';
import { useFilesSelect } from 'app/Files/_components/FilesContext';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import RenameModal from 'app/Files/_components/Toolbar/RenameModal';
import '@testing-library/jest-dom/extend-expect';

jest.mock('@tapis/tapisui-hooks');
jest.mock('app/Files/_components/FilesContext');
jest.mock('app/Files/_components/Toolbar/RenameModal');

describe('Toolbar', () => {
  beforeEach(() => {
    (Hooks.useDownload as jest.Mock).mockReturnValue({
      downloadAsync: jest.fn(),
      download: jest.fn(),
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
  });
  it('enables rename buttons', async () => {
    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo],
    });

    (RenameModal as jest.Mock).mockReturnValue(<div></div>);

    const { getByLabelText } = renderComponent(<Toolbar />);

    const renameBtn = getByLabelText('Rename');
    expect(renameBtn).toBeDefined();
    expect(renameBtn.closest('button')).not.toHaveAttribute('disabled');

    // Try clicking the rename button
    await act(async () => {
      renameBtn.click();
    });
    expect(RenameModal as jest.Mock).toHaveBeenCalled();
  });

  it('enables the move, copy, download and delete buttons', async () => {
    (useFilesSelect as jest.Mock).mockReturnValue({
      selectedFiles: [fileInfo, { ...fileInfo, type: 'dir' }],
    });

    const { getByLabelText } = renderComponent(<Toolbar />);

    const moveBtn = getByLabelText('Move');
    expect(moveBtn).toBeDefined();
    expect(moveBtn.closest('button')).not.toHaveAttribute('disabled');

    const copyBtn = getByLabelText('Copy');
    expect(copyBtn).toBeDefined();
    expect(copyBtn.closest('button')).not.toHaveAttribute('disabled');

    const deleteBtn = getByLabelText('Delete');
    expect(deleteBtn).toBeDefined();
    expect(deleteBtn.closest('button')).not.toHaveAttribute('disabled');

    const downloadBtn = getByLabelText('Download');
    expect(downloadBtn).toBeDefined();
    expect(downloadBtn.closest('button')).not.toHaveAttribute('disabled');
  });
});

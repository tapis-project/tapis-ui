import { useCallback, useState, useMemo } from 'react';
import { Files } from '@tapis/tapis-typescript';
import { GenericModal } from '../../../ui';
import { FileExplorer } from '../../../components/files';
import { SelectMode } from '../../../components/files/FileListing/FileListing';
import { Button } from 'reactstrap';

type FileSelectModalProps = {
  systemId?: string;
  path?: string;
  allowSystemChange?: boolean;
  onSelect?: (systemId: string | null, files: Array<Files.FileInfo>) => void;
  selectMode?: SelectMode;
  toggle: () => void;
  initialSelection?: Array<Files.FileInfo>;
};

const FileSelectModal: React.FC<FileSelectModalProps> = ({
  systemId,
  path,
  allowSystemChange,
  onSelect,
  toggle,
  selectMode = { mode: 'single', types: ['file', 'dir'] },
  initialSelection,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Array<Files.FileInfo>>(
    initialSelection ?? []
  );
  const [selectedSystem, setSelectedSystem] = useState<string | null>(
    systemId ?? null
  );
  const [currentPath, setCurrentPath] = useState<string>(path ?? '/');

  // Is the FileSelectModal set up to allow single directory selection?
  const dirSelectMode = useMemo(() => {
    return (
      selectMode?.mode === 'single' &&
      selectMode?.types?.length === 1 &&
      selectMode?.types?.some((mode) => mode === 'dir')
    );
  }, [selectMode]);

  const fileExplorerSelectCallback = useCallback(
    (files: Array<Files.FileInfo>) => {
      if (selectMode?.mode === 'multi') {
        setSelectedFiles([...selectedFiles, ...files]);
      } else {
        setSelectedFiles(files);
      }
    },
    [setSelectedFiles, selectedFiles, selectMode]
  );

  const fileExplorerUnselectCallback = useCallback(
    (files: Array<Files.FileInfo>) => {
      if (selectMode?.mode === 'multi') {
        setSelectedFiles(
          selectedFiles.filter(
            (selected) =>
              !files.some((unselected) => unselected.path === selected.path)
          )
        );
      } else {
        setSelectedFiles([]);
      }
    },
    [setSelectedFiles, selectedFiles, selectMode]
  );

  const fileExplorerNavigateCallback = useCallback(
    (systemId: string | null, path: string | null) => {
      setSelectedSystem(systemId);
      setSelectedFiles([]);
      setCurrentPath(path ?? '/');
    },
    [setSelectedSystem, setSelectedFiles, setCurrentPath]
  );

  const selectButtonCallback = useCallback(() => {
    if (toggle) {
      toggle();
    }
    if (onSelect) {
      if (!!selectedFiles.length) {
        onSelect(selectedSystem, selectedFiles);
      } else if (dirSelectMode) {
        onSelect(selectedSystem, [
          { name: currentPath.split('/').slice(-1)[0], path: currentPath },
        ]);
      }
    }
  }, [
    toggle,
    onSelect,
    selectedSystem,
    selectedFiles,
    currentPath,
    dirSelectMode,
  ]);

  const body = (
    <FileExplorer
      allowSystemChange={allowSystemChange}
      systemId={systemId}
      path={currentPath}
      selectMode={selectMode}
      onSelect={fileExplorerSelectCallback}
      onUnselect={fileExplorerUnselectCallback}
      onNavigate={fileExplorerNavigateCallback}
      fields={['size', 'lastModified']}
      selectedFiles={selectedFiles}
    />
  );

  const footer = (
    <Button
      disabled={selectedFiles.length === 0 && !dirSelectMode}
      color="primary"
      onClick={selectButtonCallback}
      data-testid="modalSelect"
    >
      Select{' '}
      {`${
        selectMode?.mode === 'multi'
          ? `(${selectedFiles.length})`
          : dirSelectMode
          ? `${!!selectedFiles.length ? selectedFiles[0].name : currentPath}`
          : `${!!selectedFiles.length ? selectedFiles[0].name : ''}`
      }`}
    </Button>
  );

  let title = 'Select files';
  const selectionNames =
    selectMode?.types?.map((selectType) => {
      if (selectMode.mode === 'single') {
        if (selectType === 'dir') {
          return 'directory';
        }
        return 'file';
      }
      if (selectMode.mode === 'multi') {
        if (selectType === 'dir') {
          return 'directories';
        }
        return 'files';
      }
      return 'files';
    }) ?? [];
  if (!!selectionNames.length) {
    title = `Select ${selectMode?.mode === 'multi' ? 'one or more' : 'a'} ${
      selectionNames[0]
    } ${selectionNames.length > 1 ? ` or ${selectionNames[1]}` : ''}`;
  }

  return (
    <GenericModal
      toggle={toggle}
      title={title}
      size="lg"
      body={body}
      footer={footer}
    />
  );
};

export default FileSelectModal;

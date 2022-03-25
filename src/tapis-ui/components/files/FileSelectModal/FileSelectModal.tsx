import { useCallback, useState } from 'react';
import { Files } from '@tapis/tapis-typescript';
import { GenericModal } from 'tapis-ui/_common';
import { FileExplorer } from 'tapis-ui/components/files';
import { SelectMode } from 'tapis-ui/components/files/FileListing/FileListing';
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
  selectMode,
  initialSelection,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Array<Files.FileInfo>>(
    initialSelection ?? []
  );
  const [selectedSystem, setSelectedSystem] = useState<string | null>(
    systemId ?? null
  );

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
    },
    [setSelectedSystem, setSelectedFiles]
  );

  const selectButtonCallback = useCallback(() => {
    if (toggle) {
      toggle();
    }
    if (onSelect) {
      onSelect(selectedSystem, selectedFiles);
    }
  }, [toggle, onSelect, selectedSystem, selectedFiles]);

  const body = (
    <FileExplorer
      allowSystemChange={allowSystemChange}
      systemId={systemId}
      path={path}
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
      disabled={selectedFiles.length === 0}
      color="primary"
      onClick={selectButtonCallback}
    >
      Select{' '}
      {`${
        selectMode?.mode === 'multi'
          ? `(${selectedFiles.length})`
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
      size="xl"
      body={body}
      footer={footer}
    />
  );
};

export default FileSelectModal;

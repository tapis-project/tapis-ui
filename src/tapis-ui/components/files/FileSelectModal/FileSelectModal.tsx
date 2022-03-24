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
};

const FileSelectModal: React.FC<FileSelectModalProps> = ({
  systemId,
  path,
  allowSystemChange,
  onSelect,
  toggle,
  selectMode,
}) => {
  const [selectedFiles, setSelectedFiles] = useState<Array<Files.FileInfo>>([]);
  const [selectedSystem, setSelectedSystem] = useState<string | null>(systemId ?? null);

  const fileExplorerSelectCallback = useCallback(
    (files: Array<Files.FileInfo>) => {
      setSelectedFiles(files);
    },
    [setSelectedFiles]
  );

  const fileExplorerNavigateCallback = useCallback(
    (systemId: string | null, path: string | null) => {
      setSelectedSystem(systemId);
    },
    [setSelectedSystem]
  );

  const selectButtonCallback = useCallback(
    () => {
      if (toggle) {
        toggle();
      } 
      if (onSelect) {
        onSelect(selectedSystem, selectedFiles);
      }
    },
    [ toggle, onSelect, selectedSystem, selectedFiles ]
  )

  const body = (
    <FileExplorer
      allowSystemChange={allowSystemChange}
      systemId={systemId}
      path={path}
      selectMode={selectMode}
      onSelect={fileExplorerSelectCallback}
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
      Select ({selectedFiles.length})
    </Button>
  );

  return (
    <GenericModal
      toggle={toggle}
      title={`Select Files`}
      size="xl"
      body={body}
      footer={footer}
    />
  );
};

export default FileSelectModal;

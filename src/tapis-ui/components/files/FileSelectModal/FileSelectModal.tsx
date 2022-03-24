import { useCallback, useState, useEffect } from 'react';
import { Breadcrumbs } from 'tapis-ui/_common';
import { Files, Systems } from '@tapis/tapis-typescript';
import { BreadcrumbType } from 'tapis-ui/_common/Breadcrumbs/Breadcrumbs';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import FileListing from 'tapis-ui/components/files/FileListing';
import { OnNavigateCallback } from 'tapis-ui/components/files/FileListing/FileListing';
import { SystemListing } from 'tapis-ui/components/systems';
import { normalize } from 'path';
import { GenericModal } from 'tapis-ui/_common';
import { FileExplorer } from 'tapis-ui/components/files'; 
import { SelectMode } from 'tapis-ui/components/files/FileListing/FileListing';
import { Button } from 'reactstrap';

type FileSelectModal = {
  systemId?: string;
  path?: string;
  allowSystemChange?: boolean;
  onSelect?: (files: Array<Files.FileInfo>) => void;
  selectMode?: SelectMode;
  toggle: () => void;
};

const FileSelectModal: React.FC<FileSelectModal> = ({
  systemId,
  path,
  allowSystemChange,
  onSelect,
  toggle,
  selectMode
}) => {
  const [ selectedFiles, setSelectedFiles ] = useState<Array<Files.FileInfo>>([]);

  const fileExplorerSelectCallback = useCallback(
    (files: Array<Files.FileInfo>) => {
      console.log(files);
      setSelectedFiles(files);
    },
    [ setSelectedFiles ]
  )

  const body = (
    <FileExplorer
      allowSystemChange={allowSystemChange}
      systemId={systemId}
      path={path}
      selectMode={selectMode}
      onSelect={fileExplorerSelectCallback}
    />
  )

  const footer = (
    <Button>Select ({selectedFiles.length})</Button>
  )


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

import { useCallback, useState } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper, Breadcrumbs } from 'tapis-ui/_common';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import FileListing from 'tapis-ui/components/files/FileListing';
import {
  FileListingTable,
  OnNavigateCallback,
} from 'tapis-ui/components/files/FileListing/FileListing';
import { SystemListing } from 'tapis-ui/components/systems';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { focusManager } from 'react-query';
import { useEffect } from 'react';
import { useList } from 'tapis-hooks/systems';
import { Systems } from '@tapis/tapis-typescript';
import styles from './CopyModal.module.scss';




const CopyModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
  selectedFiles = [],
}) => {
  const { pathname } = useLocation();

  const [destinationSystem, setDestinationSystem] = useState<string | undefined>(systemId);
  const [destinationPath, setDestinationPath] = useState(path);


  const onNavigate = useCallback<OnNavigateCallback>(
    (file) => {
      const newPath = `${destinationPath}/${file.name ?? '/'}`
      console.log(newPath);
      setDestinationPath(newPath);
    },
    [setDestinationPath, destinationPath]
  );

  const onSelectRoot = useCallback(
    () => {
      setDestinationPath('/');
      setDestinationSystem(undefined);
    },
    [ setDestinationPath, setDestinationSystem ]
  )

  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const onSubmit = () => {
    console.log('COPY');
  };

  const body = (
    <div className="row h-100">
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>
          Copying {selectedFiles.length} files
        </div>
        <Breadcrumbs
          breadcrumbs={[
            { text: 'Files' },
            ...breadcrumbsFromPathname(pathname)
              .splice(1)
              .map((fragment) => ({ text: fragment.text })),
          ]}
        />
        <div>
          <FileListingTable
            files={selectedFiles}
            className={`${styles.listing}`}
          />
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>
          Copying {selectedFiles.length} files
        </div>
        <Breadcrumbs
          breadcrumbs={[
            { text: 'Files' },
            ...breadcrumbsFromPathname(pathname)
              .splice(1)
              .map((fragment) => ({ text: fragment.text })),
          ]}
        />
        <div>
          {
            destinationSystem 
              ? (
                <FileListing
                  className={`${styles.listing}`}
                  systemId={destinationSystem}
                  path={destinationPath}
                  select={{ mode: 'none' }}
                  onNavigate={onNavigate}
                />
              )
              : (
                <SystemListing />
              )
          }
        </div>
      </div>
    </div>
  );

  return (
    <GenericModal
      toggle={toggle}
      title="Copy Files"
      size="xl"
      body={body}
      footer={<div>Footer</div>}
    />
  );
};

export default CopyModal;

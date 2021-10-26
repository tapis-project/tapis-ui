import { useCallback, useState } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper, Breadcrumbs } from 'tapis-ui/_common';
import { BreadcrumbType } from 'tapis-ui/_common/Breadcrumbs/Breadcrumbs';
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

  const [destinationSystem, setDestinationSystem] = useState<string | null>(
    systemId
  );
  const [destinationPath, setDestinationPath] = useState(path);
  const [destinationBreadcrumbs, setDestinationBreadcrumbs] = useState<
    Array<BreadcrumbType>
  >([]);

  const onNavigate = useCallback<OnNavigateCallback>(
    (file) => {
      const normalizedFilename = file.name?.startsWith('/') ? file.name?.slice(1) : file.name;
      const newPath = `${destinationPath}${destinationPath.endsWith('/') ? '' : '/'}${normalizedFilename}/`;
      setDestinationPath(newPath);
    },
    [setDestinationPath, destinationPath, setDestinationBreadcrumbs]
  );

  const onSystemNavigate = useCallback(
    (system: Systems.TapisSystem | null) => {
      setDestinationSystem(system?.id ?? null);
      setDestinationPath('/');
    },
    [setDestinationPath, setDestinationSystem]
  );

  useEffect(
    () => {
      console.log("CALCULATING BREADCRUMBS FOR", destinationPath);
      const breadcrumbs: Array<BreadcrumbType> = breadcrumbsFromPathname(destinationPath);
      const newCrumbs: Array<BreadcrumbType> = breadcrumbs.map(
        (breadcrumb) => ({
          ...breadcrumb, 
          onClick: (to: string) => { console.log("going to ", to); setDestinationPath(to) },
        })
      );
      setDestinationBreadcrumbs(newCrumbs);
      console.log(newCrumbs);
    },
    [setDestinationBreadcrumbs, destinationPath, setDestinationPath]
  )

  const onSuccess = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const onSubmit = () => {
    console.log('COPY');
  };

  console.log('Destination breadcrumbs', destinationBreadcrumbs);

  const body = (
    <div className="row h-100">
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>
          Copying {selectedFiles.length} files
        </div>
        <Breadcrumbs
          breadcrumbs={[
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
            { text: 'Files', onClick: () => onSystemNavigate(null) },
            ...destinationBreadcrumbs,
          ]}
        />
        <div>
          {destinationSystem ? (
            <FileListing
              className={`${styles.listing}`}
              systemId={destinationSystem}
              path={destinationPath}
              select={{ mode: 'none' }}
              onNavigate={onNavigate}
            />
          ) : (
            <SystemListing />
          )}
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

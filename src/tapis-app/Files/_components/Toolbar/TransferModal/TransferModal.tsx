import React, { useCallback, useState, useEffect } from 'react';
import { GenericModal, Breadcrumbs } from 'tapis-ui/_common';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import { FileListingTable } from 'tapis-ui/components/files/FileListing/FileListing';
import { FileExplorer } from '../_components';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { Files } from '@tapis/tapis-typescript';
import styles from './TransferModal.module.scss';
import { useFilesSelect } from '../../FilesContext';
import { Tabs } from 'tapis-app/_components';
import { focusManager } from 'react-query';
import {
  TransferListing,
  TransferDetails,
  TransferCreate,
  TransferCancel,
} from 'tapis-ui/components/files';

const TransferModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
}) => {
  const { pathname } = useLocation();
  const [destination, setDestination] = useState<{
    systemId: string;
    path: string;
  }>({ systemId, path });
  const [transfer, setTransfer] = useState<Files.TransferTask | null>(null);
  const { selectedFiles } = useFilesSelect();

  useEffect(() => {
    const interval = setInterval(() => {
      focusManager.setFocused(true);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const onNavigate = useCallback(
    (systemId: string | null, path: string | null) => {
      if (!!systemId && !!path) {
        setDestination({ systemId, path });
      }
    },
    [setDestination]
  );

  const onSelect = useCallback(
    (transfer: Files.TransferTask) => {
      console.log(transfer);
      setTransfer(transfer);
    },
    [setTransfer]
  );

  const createTransferTab = (
    <div className={`row h-100 ${styles.pane}`}>
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>
          Transfering {selectedFiles.length} files
        </div>
        <Breadcrumbs
          breadcrumbs={[
            ...breadcrumbsFromPathname(pathname)
              .splice(1)
              .map((fragment) => ({ text: fragment.text })),
          ]}
        />
        <div className={styles['nav-list']}>
          <FileListingTable
            files={selectedFiles}
            className={`${styles['file-list-origin']} `}
            fields={['size']}
          />
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>Destination</div>
        <FileExplorer
          systemId={systemId}
          path={path}
          onNavigate={onNavigate}
          allowSystemChange
        />
        <TransferCreate
          sourceSystemId={systemId}
          destinationSystemId={destination?.systemId ?? ''}
          destinationPath={destination?.path ?? ''}
          files={selectedFiles}
        />
      </div>
    </div>
  );

  const listTransfersTab = (
    <div className={`row h-100 ${styles.pane}`}>
      <div className="col-md-6 d-flex flex-column">
        <div className={`${styles['nav-list']} ${styles['transfer-list']}`}>
          <TransferListing onSelect={onSelect} />
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column">
        <div>
          {transfer ? (
            <div>
              <TransferDetails
                transferTaskId={transfer?.uuid!}
                className={styles['transfer-detail']}
              />
              <TransferCancel
                transferTaskId={transfer?.uuid!}
                className={styles['transfer-cancel']}
              />
            </div>
          ) : (
            <i>Select a file transfer to view details</i>
          )}
        </div>
      </div>
    </div>
  );

  const tabs: { [name: string]: React.ReactNode } = {};
  if (selectedFiles.length > 0) {
    tabs['Start a Transfer'] = createTransferTab;
  }
  tabs['Recent Transfers'] = listTransfersTab;

  const body = <Tabs tabs={tabs} className={styles.body} />;

  return (
    <GenericModal
      toggle={toggle}
      title="Transfer Files"
      size="xl"
      body={body}
    />
  );
};

export default TransferModal;

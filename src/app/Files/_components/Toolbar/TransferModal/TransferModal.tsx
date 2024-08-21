import React, { useCallback, useState, useEffect } from 'react';
import { GenericModal, Breadcrumbs } from '@tapis/tapisui-common';
import { breadcrumbsFromPathname } from '@tapis/tapisui-common';
import { FileListingTable } from '@tapis/tapisui-common';
import { FileExplorer } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router-dom';
import { Files } from '@tapis/tapis-typescript';
import styles from './TransferModal.module.scss';
import { useFilesSelect } from '../../FilesContext';
import { Tabs } from '@tapis/tapisui-common';
import {
  TransferListing,
  TransferDetails,
  TransferCreate,
  TransferCancel,
} from '@tapis/tapisui-common';
import { Files as Hooks } from '@tapis/tapisui-hooks';

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

  const { refetch } = Hooks.Transfers.useList({});

  useEffect(() => {
    const interval = setInterval(() => {
      refetch();
    }, 5000);
    return () => clearInterval(interval);
  }, [refetch]);

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
          fields={['size']}
          className={styles['file-list']}
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

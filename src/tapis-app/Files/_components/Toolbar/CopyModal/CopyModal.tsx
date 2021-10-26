import { useCallback } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, FieldWrapper, Breadcrumbs } from 'tapis-ui/_common';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import { FileListingTable } from 'tapis-ui/components/files/FileListing';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { focusManager } from 'react-query';
import { useEffect } from 'react';
import styles from './CopyModal.module.scss';
import { string } from 'prop-types';

const CopyModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  currentPath = '/',
  selectedFiles = [],
}) => {
  const { pathname } = useLocation();

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
        <div className="filesListing">
          <FileListingTable
            files={selectedFiles}
            className={`${styles.listing}`}
          />
        </div>
      </div>
    </div>
  );

  return (
    <GenericModal
      toggle={toggle}
      title="Copy Files"
      size="lg"
      body={body}
      footer={<div>Footer</div>}
    />
  );
};

export default CopyModal;

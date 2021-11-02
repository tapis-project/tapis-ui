import { useCallback, useState, useReducer, useEffect } from 'react';
import { Button, Input } from 'reactstrap';
import { GenericModal, Breadcrumbs, Icon, LoadingSpinner } from 'tapis-ui/_common';
import { SubmitWrapper } from 'tapis-ui/_wrappers';
import breadcrumbsFromPathname from 'tapis-ui/_common/Breadcrumbs/breadcrumbsFromPathname';
import { FileListingTable } from 'tapis-ui/components/files/FileListing/FileListing';
import { FileExplorer } from '../_components';
import { ToolbarModalProps } from '../Toolbar';
import { useLocation } from 'react-router';
import { focusManager } from 'react-query';
import { useCopy } from 'tapis-hooks/files';
import { CopyHookParams } from 'tapis-hooks/files/useCopy';
import { Files } from'@tapis/tapis-typescript';
import { useMutations } from 'tapis-hooks/utils';
import { Row, Column, CellProps } from 'react-table';
import styles from './CopyModal.module.scss';

const CopyModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
  selectedFiles = [],
}) => {
  const { pathname } = useLocation();
  const [ copyError, setCopyError ] = useState<Error | null>(null);
  const [ destinationPath, setDestinationPath ] = useState<string | null>(path);

  type CopyState = {
    [path: string]: string;
  }
  const reducer = (state: CopyState, action: { path: string, icon: string}) => {
    return {
      ...state,
      [action.path]: action.icon
    }
  }
  const [copyState, dispatch] = useReducer(reducer, {} as CopyState);

  const { copyAsync } = useCopy();
  const onFileCopySuccess = useCallback(
    (operation: CopyHookParams, data: Files.FileStringResponse) => {
      dispatch({ path: operation.path, icon: 'approved-reverse' })
    },
    [ dispatch ]
  );
  const onFileCopyError = useCallback(
    (operation: CopyHookParams, error: Error) => {
      dispatch({ path: operation.path, icon: 'alert' });
      setCopyError(error);
    },
    [ dispatch, setCopyError ]
  )
  const onFileCopyStart = useCallback(
    (operation: CopyHookParams) => {
      dispatch({ path: operation.path, icon: 'loading' })
    },
    [ dispatch ]
  )
  const onComplete = useCallback(() => {
    // Calling the focus manager triggers react-query's
    // automatic refetch on window focus
    focusManager.setFocused(true);
  }, []);

  const onNavigate = useCallback(
    (systemId: string | null, path: string | null) => {
      setDestinationPath(path);
    },
    [ setDestinationPath ]
  )

  const { run, isRunning, isFinished } = useMutations<CopyHookParams, Files.FileStringResponse>({
    fn: copyAsync,
    onSuccess: onFileCopySuccess,
    onError: onFileCopyError,
    onStart: onFileCopyStart,
    onComplete
  });

  const onSubmit = useCallback(
    () => {
      const operations: Array<CopyHookParams> = selectedFiles.map(
        (file) => ({ 
          systemId,
          newPath: destinationPath!,
          path: file.path!
        })
      )
      run(operations);
    },
    [ selectedFiles, run, destinationPath ]
  );

  const statusColumns: Array<Column> = [
    {
      Header: '',
      id: 'copyStatus',
      Cell: (el) => {
        const path = (el.row.original as Files.FileInfo).path;
        const status = path && copyState[path];
        if (status) {
          if (status === 'loading') {
            return <LoadingSpinner placement="inline"/>
          }
          return <Icon name={status} />
        }
        return null;
      }
    }
  ]

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
        <div className={styles['nav-list']}>
          <FileListingTable
            files={selectedFiles}
            className={`${styles['file-list-origin']} `}
            fields={['size']}
            appendColumns={statusColumns}
          />
        </div>
      </div>
      <div className="col-md-6 d-flex flex-column">
        {/* Table of selected files */}
        <div className={`${styles['col-header']}`}>
          Destination
        </div>
        <FileExplorer 
          systemId={systemId}
          path={path}
          onNavigate={onNavigate}
        />
      </div>
    </div>
  );

  const footer = (
    <SubmitWrapper
      isLoading={isRunning}
      error={copyError}
      success={isFinished && !copyError ? `Successfully copied` : ''}
      reverse={true}
    >
      <Button
        color="primary"
        disabled={!destinationPath || destinationPath === path || isRunning || isFinished && !copyError}
        aria-label="Submit"
        type="submit"
        onClick={onSubmit}
      >
        Copy
      </Button>
    </SubmitWrapper>
  ) 

  return (
    <GenericModal
      toggle={toggle}
      title="Copy Files"
      size="xl"
      body={body}
      footer={footer}
    />
  );
};

export default CopyModal;

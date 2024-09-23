import { useEffect, useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import { GenericModal } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { FileListingTable } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { focusManager } from 'react-query';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { Column } from 'react-table';
import styles from './CreatePostitModal.module.scss';
import { useFilesSelect } from '../../FilesContext';
import { Files } from '@tapis/tapis-typescript';
import { useFileOperations } from '../_hooks';
import { FileOperationStatus } from '../_components';
import { Link } from 'react-router-dom';

const CreatePostitModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
}) => {
  const [postit, setPostit] = useState<string | undefined>(undefined);
  const { selectedFiles, unselect } = useFilesSelect();
  const { create, reset, isLoading, error, isSuccess } =
    Hooks.PostIts.useCreate();

  useEffect(() => {
    reset();
  }, [reset]);

  const onSubmit = useCallback(() => {
    create(
      {
        systemId,
        path: selectedFiles[0].path!,
        createPostItRequest: {
          allowedUses: 1,
          validSeconds: 60,
        },
      },
      {
        onSuccess: (value) => {
          setPostit(value.result?.redeemUrl);
        },
      }
    );
  }, [selectedFiles, path, systemId]);

  return (
    <GenericModal
      toggle={() => {
        toggle();
        unselect(selectedFiles);
      }}
      title={`View files and folders`}
      body={
        <div>
          <a href={postit ?? ''}>{postit ?? ''}</a>
        </div>
      }
      footer={
        <SubmitWrapper
          isLoading={false}
          error={error}
          success={isSuccess ? 'Created postit' : ''}
          reverse={true}
        >
          <Button
            color="primary"
            disabled={isLoading || isSuccess || selectedFiles.length === 0}
            aria-label="Submit"
            onClick={onSubmit}
          >
            Create Postit
          </Button>
          {!isSuccess && (
            <Button
              color="danger"
              disabled={isLoading || isSuccess || selectedFiles.length === 0}
              aria-label="Cancel"
              onClick={() => {
                toggle();
              }}
            >
              Cancel
            </Button>
          )}
        </SubmitWrapper>
      }
    />
  );
};

export default CreatePostitModal;

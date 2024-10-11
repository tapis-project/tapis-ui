import { useEffect, useCallback, useState } from 'react';
import { Button } from 'reactstrap';
import { GenericModal, LoadingSpinner } from '@tapis/tapisui-common';
import { SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { useFilesSelect } from '../../FilesContext';
import { Alert, AlertTitle } from '@mui/material';

const CreatePostitModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
}) => {
  const [postit, setPostit] = useState<string | undefined>(undefined);
  const { selectedFiles, unselect } = useFilesSelect();
  const { create, isLoading, isError, error, isSuccess } =
    Hooks.PostIts.useCreate();
  const maxFileSize = 50000000;

  useEffect(() => {
    if (!postit) {
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
    }
  }, [systemId, path]);

  return (
    <GenericModal
      size="xl"
      toggle={() => {
        toggle();
        unselect(selectedFiles);
      }}
      title={``}
      body={
        <div style={{ justifyContent: 'center', position: 'relative' }}>
          {isError && error && (
            <Alert severity="error">
              <AlertTitle>Error fetching file</AlertTitle>
              {error.message}
            </Alert>
          )}
          {selectedFiles[0].size! > maxFileSize && (
            <Alert severity="error">
              <AlertTitle>File Too Large</AlertTitle>
              The file you are trying to view is larger than the maximum
              permitted file size of {maxFileSize} bytes
            </Alert>
          )}
          {isSuccess &&
            selectedFiles[0].size! <= maxFileSize &&
            (selectedFiles[0].size! === 0 ? (
              <Alert severity="warning">
                <AlertTitle>Nothing to show</AlertTitle>
                This file has 0 bytes
              </Alert>
            ) : (
              <iframe
                width={'100%'}
                height={'500px'}
                style={{ overflowY: 'auto', border: 'none', margin: '0 auto' }}
                src={postit ?? ''}
              />
            ))}
        </div>
      }
    />
  );
};

export default CreatePostitModal;

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, AlertTitle, TextField, Stack } from '@mui/material';
import { Button } from 'reactstrap';
import { GenericModal, SubmitWrapper } from '@tapis/tapisui-common';
import { ToolbarModalProps } from '../Toolbar';
import { Files as Hooks } from '@tapis/tapisui-hooks';
import { useFilesSelect } from '../../FilesContext';

const DEFAULT_ALLOWED_USES = 1;
const DEFAULT_VALID_SECONDS = 3600; // 1 hour

const ShareModal: React.FC<ToolbarModalProps> = ({
  toggle,
  systemId = '',
  path = '/',
}) => {
  const { selectedFiles, unselect } = useFilesSelect();
  const { create, isLoading, isError, error, isSuccess, data, reset } =
    Hooks.PostIts.useCreate();

  const [allowedUses, setAllowedUses] = useState<number>(DEFAULT_ALLOWED_USES);
  const [validSeconds, setValidSeconds] = useState<number>(
    DEFAULT_VALID_SECONDS
  );
  const [redeemUrl, setRedeemUrl] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'success' | 'error'>(
    'idle'
  );

  const selected = selectedFiles[0];
  const isDir = selected?.type === 'dir';
  const isMultipleSelection = selectedFiles.length > 1;

  const description = useMemo(() => {
    if (!selected) return '';
    const kind = isDir ? 'folder' : 'file';
    return `You are creating a shareable link for the ${kind} "${selected.name}".`;
  }, [selected, isDir]);

  useEffect(() => {
    if (data?.result?.redeemUrl) {
      // Add download parameter to force download instead of display
      const url = new URL(data.result.redeemUrl);
      url.searchParams.set('download', 'true');
      setRedeemUrl(url.toString());
    }
  }, [data]);

  const onGenerate = useCallback(() => {
    if (!selected) return;
    setRedeemUrl('');
    create(
      {
        systemId,
        path: selected.path!,
        createPostItRequest: {
          allowedUses,
          validSeconds,
        },
      },
      {
        onSuccess: (resp) => {
          if (resp.result?.redeemUrl) {
            // Add download parameter to force download instead of display
            const url = new URL(resp.result.redeemUrl);
            url.searchParams.set('download', 'true');
            setRedeemUrl(url.toString());
          } else {
            setRedeemUrl('');
          }
        },
      }
    );
  }, [create, systemId, selected, allowedUses, validSeconds]);

  const onClose = useCallback(() => {
    reset();
    setRedeemUrl('');
    setCopyStatus('idle');
    unselect(selectedFiles);
    toggle();
  }, [reset, toggle, unselect, selectedFiles]);

  const handleCopyToClipboard = useCallback(async () => {
    if (!redeemUrl) {
      setCopyStatus('error');
      return;
    }

    try {
      await navigator.clipboard.writeText(redeemUrl);
      setCopyStatus('success');
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      setCopyStatus('error');
    }

    // Reset status after 2 seconds
    setTimeout(() => {
      setCopyStatus('idle');
    }, 2000);
  }, [redeemUrl]);

  return (
    <GenericModal
      size="lg"
      toggle={onClose}
      title={'Share via PostIt'}
      body={
        <div>
          {isError && error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              <AlertTitle>Error creating link</AlertTitle>
              {error.message}
            </Alert>
          )}
          {isMultipleSelection && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              <AlertTitle>Multiple files selected</AlertTitle>
              You have selected {selectedFiles.length} items. To share multiple
              files, select them one at a time or create a folder containing all
              files.
            </Alert>
          )}
          <p>{description}</p>
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <TextField
              label="Allowed Uses"
              type="number"
              size="small"
              value={allowedUses}
              onChange={(e) =>
                setAllowedUses(Math.max(1, Number(e.target.value)))
              }
              inputProps={{ min: 1 }}
            />
            <TextField
              label="Valid Seconds"
              type="number"
              size="small"
              value={validSeconds}
              onChange={(e) =>
                setValidSeconds(Math.max(1, Number(e.target.value)))
              }
              inputProps={{ min: 1 }}
            />
          </Stack>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <SubmitWrapper
              isLoading={isLoading}
              error={null}
              success={redeemUrl ? 'Link created' : undefined}
            >
              <Button
                color="primary"
                onClick={onGenerate}
                disabled={!selected || isMultipleSelection}
              >
                Generate Link
              </Button>
            </SubmitWrapper>
            <div style={{ flex: 1 }}>
              <div className="input-group">
                <div className="input-group-prepend">
                  <Button
                    color={
                      copyStatus === 'success'
                        ? 'success'
                        : copyStatus === 'error'
                        ? 'danger'
                        : 'secondary'
                    }
                    onClick={handleCopyToClipboard}
                    disabled={!redeemUrl}
                    type="button"
                    style={{
                      minWidth: '80px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {copyStatus === 'success'
                      ? '✓ Copied!'
                      : copyStatus === 'error'
                      ? '✗ Failed'
                      : 'Copy'}
                  </Button>
                </div>
                <input
                  type="text"
                  value={redeemUrl}
                  className="form-control"
                  placeholder="Shareable link will appear here"
                  readOnly
                  style={{
                    backgroundColor: '#f8f9fa',
                    cursor: 'text',
                  }}
                />
              </div>
            </div>
          </div>
          {isSuccess && redeemUrl && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Link created. You can share this URL with users without
              authentication.
            </Alert>
          )}
        </div>
      }
    />
  );
};

export default ShareModal;

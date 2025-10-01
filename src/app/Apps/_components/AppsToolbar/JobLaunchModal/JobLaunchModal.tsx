import { useEffect, useCallback, useState } from 'react';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Jobs as Hooks } from '@tapis/tapisui-hooks';
import { Apps, Jobs } from '@tapis/tapis-typescript';
import { JSONEditor } from '@tapis/tapisui-common';
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import { JobLauncher } from '@tapis/tapisui-common';

export type ToolbarModalProps = {
  toggle: () => void;
  app: Apps.TapisApp;
};

import { Close, DataObject, RocketLaunch } from '@mui/icons-material';

const JobLaunchModal: React.FC<ToolbarModalProps> = ({ toggle, app }) => {
  const { isLoading, isSuccess, error, reset, submit } = Hooks.useSubmit(
    app.id!,
    app.version!
  );

  const [guided, setGuided] = useState<boolean | undefined>(undefined);

  const onSuccess = useCallback(() => {
    // invalidate()
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  return (
    <Dialog
      open={true}
      onClose={() => {
        toggle();
      }}
      aria-labelledby="Submit Job"
      aria-describedby="A modal for submitting a job"
      maxWidth={false} // disables the default maxWidth constraints
      fullWidth={false} // prevents auto-stretching to 100%
      PaperProps={{
        style: { width: 'auto' }, // optional, helps content dictate width
      }}
    >
      <DialogTitle id="dialog-title">
        Submit Job
        <IconButton
          aria-label="close"
          onClick={toggle}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {guided === undefined && (
          <div style={{ display: 'flex', flexDirection: 'row', gap: '16px' }}>
            <Button
              variant={'outlined'}
              onClick={() => {
                setGuided(true);
              }}
              size="large"
              startIcon={<RocketLaunch />}
            >
              Use guided job launcher
            </Button>
            <Button
              variant={'outlined'}
              onClick={() => {
                setGuided(false);
              }}
              size="large"
              startIcon={<DataObject />}
            >
              Submit with JSON
            </Button>
          </div>
        )}
        {guided === true && (
          <div style={{ display: 'block', width: '80vw' }}>
            <JobLauncher appId={app.id!} appVersion={app.version!} />
          </div>
        )}
        {guided === false && (
          <JSONEditor
            style={{ width: '800px', marginTop: '8px', maxHeight: '500px' }}
            renderNewlinesInError
            obj={{ appId: app.id!, appVersion: app.version! }}
            actions={[
              {
                color: !isSuccess ? 'error' : 'info',
                name: !isSuccess ? 'cancel' : 'continue',
                actionFn: toggle,
              },
              {
                name: 'submit job',
                disableOnError: true,
                disableOnUndefined: true,
                disableOnIsLoading: true,
                disableOnSuccess: true,
                error:
                  error !== null
                    ? {
                        title: 'Error',
                        message: error.message,
                      }
                    : undefined,
                result: isSuccess
                  ? {
                      success: isSuccess,
                      message: 'Successfully submitted job',
                    }
                  : undefined,
                isLoading,
                isSuccess,
                // validator: (obj:  | undefined) => {
                //   let success: boolean = false;
                //   let message: string = "";
                //   try {
                //     validationSchema.validateSync(obj, { abortEarly: false });
                //     success = true
                //   } catch (e) {
                //     (e as Yup.ValidationError).errors.map((msg, i) => message = message + `#${i + 1}: ${msg}\n`)
                //   }

                //   return {
                //     success,
                //     message
                //   }
                // },
                actionFn: (obj: Partial<Jobs.ReqSubmitJob> | undefined) => {
                  if (obj !== undefined) {
                    submit(obj as Jobs.ReqSubmitJob, { onSuccess });
                  }
                },
              },
            ]}
            onCloseError={() => {
              reset();
            }}
            onCloseSuccess={() => {
              reset();
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default JobLaunchModal;

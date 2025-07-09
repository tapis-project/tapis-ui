import { useEffect, useCallback } from 'react';
import * as Yup from 'yup';
import { useQueryClient } from 'react-query';
import { Apps as Hooks } from '@tapis/tapisui-hooks';
import { Apps } from '@tapis/tapis-typescript';
import { JSONEditor } from '@tapis/tapisui-common';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';

export type ToolbarModalProps = {
  toggle: () => void;
  app: Apps.TapisApp;
};

import { RuntimeEnum, RuntimeOptionEnum } from '@tapis/tapis-typescript-apps';
import { Close } from '@mui/icons-material';

const UpdateAppModal: React.FC<ToolbarModalProps> = ({ toggle, app }) => {
  const { isLoading, isSuccess, error, reset, patch, invalidate } =
    Hooks.usePatch();

  const onSuccess = useCallback(() => {
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    reset();
  }, [reset]);

  const runtimeValues = Object.values(RuntimeEnum);
  const runtimeOptionsValues = Object.values(RuntimeOptionEnum); // as RuntimeOptionEnum[];

  const validationSchema = Yup.object({
    containerImage: Yup.string()
      .min(1, 'Container Image must be at least 1 character long')
      .max(80, 'Container Image should not be longer than 80 characters')
      .matches(
        /^[a-zA-Z0-9_.\-/:]+$/,
        "Container Image must contain only alphanumeric characters, '.', '_', '-', '/', ':'"
      )
      .required('Container Image is a required field'),
    description: Yup.string().max(
      2048,
      'Description should not be longer than 2048 characters'
    ),
    enabled: Yup.boolean(),
    locked: Yup.boolean(),
    runtimeVersion: Yup.string(),
    runtime: Yup.string().oneOf(runtimeValues),
    runtimeOptions: Yup.string()
      .nullable(true)
      .oneOf([...runtimeOptionsValues, ''], 'Invalid runtime option'),
    maxJobs: Yup.number().integer('Max Jobs must be an integer').nullable(),
    maxJobsPerUser: Yup.number()
      .integer('Max Jobs Per User must be an integer')
      .nullable(),
    strictFileInputs: Yup.boolean(),
    tags: Yup.array().of(
      Yup.string().max(50, 'Tags should not be longer than 50 characters')
    ),
    jobAttributes: Yup.object({
      dynamicExecSystem: Yup.boolean(),
      execSystemId: Yup.string(),
      execSystemExecDir: Yup.string(),
      execSystemInputDir: Yup.string(),
      execSystemOutputDir: Yup.string(),
      execSystemLogicalQueue: Yup.string(),
      archiveSystemId: Yup.string(),
      archiveSystemDir: Yup.string(),
      archiveOnAppError: Yup.boolean(),
      isMpi: Yup.boolean(),
      mpiCmd: Yup.string(),
      cmdPrefix: Yup.string(),
      nodeCount: Yup.number()
        .integer()
        .min(1, 'Node count must be at least 1')
        .nullable(),
      coresPerNode: Yup.number()
        .integer()
        .min(1, 'Cores per node must be at least 1')
        .nullable(),
      memoryMB: Yup.number()
        .integer()
        .min(1, 'Memory in MB must be at least 1')
        .nullable(),
      maxMinutes: Yup.number()
        .integer()
        .min(1, 'Max minutes must be at least 1')
        .nullable(),
      parameterSet: Yup.object({
        envVariables: Yup.array(
          Yup.object({
            key: Yup.string()
              .min(1)
              .required('A key name is required for this environment variable'),
            value: Yup.string().required(
              'A value is required for this environment variable'
            ),
          })
        ),
        archiveFilter: Yup.object({
          includes: Yup.array(
            Yup.string()
              .min(1)
              .required('A pattern must be specified for this include')
          ),
          excludes: Yup.array(
            Yup.string()
              .min(1)
              .required('A pattern must be specified for this exclude')
          ),
          includeLaunchFiles: Yup.boolean(),
        }),
        fileInputs: Yup.array().of(
          Yup.object().shape({
            name: Yup.string().min(1).required('A fileInput name is required'),
            targetPath: Yup.string()
              .min(1)
              .required('A targetPath is required'),
            autoMountLocal: Yup.boolean(),
          })
        ),
        fileInputArrays: Yup.array().of(
          Yup.object().shape({
            name: Yup.string()
              .min(1)
              .required('A fileInputArray name is required'),
            targetDir: Yup.string().min(1).required('A targetDir is required'),
          })
        ),
      }),
    }),
  });

  return (
    <Dialog
      open={true}
      onClose={toggle}
      aria-labelledby="Update App"
      aria-describedby="A modal for updating an app"
      maxWidth={false} // disables the default maxWidth constraints
      fullWidth={false} // prevents auto-stretching to 100%
      PaperProps={{
        style: { width: 'auto' }, // optional, helps content dictate width
      }}
    >
      <DialogTitle id="dialog-title">
        Update App
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
        <JSONEditor
          style={{ width: '800px', marginTop: '8px', maxHeight: '500px' }}
          renderNewlinesInError
          obj={app as Apps.ReqPatchApp}
          actions={[
            {
              color: !isSuccess ? 'error' : 'info',
              name: !isSuccess ? 'cancel' : 'close',
              actionFn: toggle,
            },
            {
              name: 'update app',
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
                    message: 'Successfully updated app',
                  }
                : undefined,
              isLoading,
              isSuccess,
              validator: (obj: Apps.ReqPatchApp | undefined) => {
                let success: boolean = false;
                let message: string = '';
                try {
                  validationSchema.validateSync(obj, { abortEarly: false });
                  success = true;
                } catch (e) {
                  (e as Yup.ValidationError).errors.map(
                    (msg, i) => (message = message + `#${i + 1}: ${msg}\n`)
                  );
                }

                return {
                  success,
                  message,
                };
              },
              actionFn: (obj: Apps.ReqPatchApp | undefined) => {
                if (obj !== undefined) {
                  patch(
                    {
                      appId: app.id!,
                      appVersion: app.version!,
                      reqPatchApp: obj,
                    },
                    { onSuccess }
                  );
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
      </DialogContent>
    </Dialog>
  );
};

export default UpdateAppModal;

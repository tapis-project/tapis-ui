import { useEffect, useCallback } from 'react';
import * as Yup from 'yup';
import { Systems as Hooks } from '@tapis/tapisui-hooks';
import { Systems } from '@tapis/tapis-typescript';
import { JSONEditor } from '../../../../ui';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

export type ToolbarModalProps = {
  toggle: () => void;
  system: Systems.TapisSystem;
};

const UpdateSystemModal: React.FC<ToolbarModalProps> = ({ toggle, system }) => {
  const { isLoading, isSuccess, error, reset, patch, invalidate } =
    Hooks.usePatch();

  const onSuccess = useCallback(() => {
    invalidate();
  }, [invalidate]);

  useEffect(() => {
    reset();
  }, [reset]);

  const validationSchema = Yup.object({
    description: Yup.string().max(
      2048,
      'Description should not be longer than 2048 characters'
    ),
  });

  return (
    <Dialog
      open={true}
      onClose={toggle}
      aria-labelledby="Update System"
      aria-describedby="A modal for updating an system"
      maxWidth={false} // disables the default maxWidth constraints
      fullWidth={false} // prevents auto-stretching to 100%
      PaperProps={{
        style: { width: 'auto' }, // optional, helps content dictate width
      }}
    >
      <DialogTitle id="dialog-title">
        Update System
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
          obj={system as Systems.ReqPatchSystem}
          actions={[
            {
              color: !isSuccess ? 'error' : 'info',
              name: !isSuccess ? 'cancel' : 'close',
              actionFn: toggle,
            },
            {
              name: 'update system',
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
                    message: 'Successfully updated system',
                  }
                : undefined,
              isLoading,
              isSuccess,
              validator: (obj: Systems.ReqPatchSystem | undefined) => {
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
              actionFn: (obj: Systems.ReqPatchSystem | undefined) => {
                if (obj !== undefined) {
                  patch(
                    {
                      systemId: system.id!,
                      reqPatchSystem: obj,
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

export default UpdateSystemModal;

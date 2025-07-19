import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { MUIStepper, useStepperState } from 'app/_components';
import { QueryWrapper } from '@tapis/tapisui-common';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  SelectChangeEvent,
  Alert,
  AlertTitle,
  Input,
  IconButton,
  Autocomplete,
  TextField,
  OutlinedInput,
} from '@mui/material';
import { useAppSelector } from '@redux';
import { Close, Login } from '@mui/icons-material';

const NameStep: React.FC = () => {
  const { state, updateState } = useStepperState();

  return (
    <TextField
      fullWidth
      size="small"
      margin="dense"
      label="Variable name"
      defaultValue={state.value}
      onChange={(e) => {
        updateState({ name: e.target.value });
      }}
      style={{ marginTop: '16px' }}
    />
  );
};

const ValueStep: React.FC = () => {
  const { state, updateState } = useStepperState();

  return (
    <TextField
      fullWidth
      size="small"
      margin="dense"
      label="Variable value"
      defaultValue={state.value}
      onChange={(e) => {
        updateState({ value: e.target.value });
      }}
      style={{ marginTop: '16px' }}
    />
  );
};

const TypeStep: React.FC = () => {
  const { state, updateState } = useStepperState();

  return (
    <TextField
      fullWidth
      size="small"
      margin="dense"
      label="Type"
      defaultValue={state.type}
      onChange={(e) => {
        updateState({ type: e.target.value });
      }}
      style={{ marginTop: '16px' }}
    />
  );
};

type AddPipelineEnvVarModalProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
  open: boolean;
  toggle: () => void;
};

type EnvVar = {
  name: string;
  value: string | number;
  type: string;
};

const AddPipelineEnvVarModal: React.FC<AddPipelineEnvVarModalProps> = ({
  open,
  toggle,
  groupId,
  pipeline,
}) => {
  const { patch, isLoading, isError, error, isSuccess, invalidate, reset } =
    Hooks.Pipelines.usePatch();

  const env = pipeline.env || {};

  const patchEnvVars = (envVar: EnvVar) => {
    patch(
      {
        groupId,
        pipelineId: pipeline.id!,
        reqPatchPipeline: {
          env: {
            ...env,
            [envVar.name]: {
              value: envVar.value,
              type: envVar.type,
            },
          },
        },
      },
      {
        onSuccess: () => {
          invalidate();
        },
        onError: (e) => {
          console.log(e.message);
        },
      }
    );
  };

  return (
    <Dialog
      fullWidth
      open={open}
      onClose={toggle}
      aria-labelledby="Update pipeline environment"
      aria-describedby="A modal for creating and updating env vars"
    >
      <DialogTitle id="alert-dialog-title">
        Update pipeline environment
        <IconButton
          aria-label="close"
          onClick={toggle}
          sx={{
            position: 'absolute',
            right: '16px',
            top: '8px',
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        {isError && error && (
          <Alert
            style={{ marginBottom: '8px' }}
            severity="error"
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error.message}
          </Alert>
        )}
        <MUIStepper
          initialState={{
            name: undefined,
            value: undefined,
            type: undefined,
          }}
          backDisabled={isSuccess}
          nextIsLoading={isLoading}
          nextDisabled={isError || isLoading || isSuccess}
          onClickFinish={(state) => {
            if (state.name && state.value && state.type) {
              patchEnvVars({
                name: state.name,
                value: state.value,
                type: state.type,
              });
            }
          }}
          finishButtonText="finish"
          steps={[
            {
              label: 'Variable name',
              element: <NameStep />,
              nextCondition: (state) => state.name !== undefined,
            },
            {
              label: 'Variable value',
              element: <ValueStep />,
              nextCondition: (state) => state.value !== undefined,
            },
            {
              label: 'Value type',
              element: <TypeStep />,
              nextCondition: (state) => state.type !== undefined,
            },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default AddPipelineEnvVarModal;

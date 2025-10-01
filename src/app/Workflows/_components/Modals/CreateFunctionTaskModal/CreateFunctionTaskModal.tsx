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
import { Close, Login } from '@mui/icons-material';
import { resolveFunctionTaskRuntimeImage } from 'app/Workflows/utils';
import { encode } from 'base-64';

const RuntimeStep: React.FC = () => {
  const { state, updateState } = useStepperState();

  const runtimes = Object.values(Workflows.EnumRuntimeEnvironment).map(
    (r) => r as string
  );

  return (
    <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
      <Autocomplete
        options={runtimes}
        getOptionLabel={(runtime) => runtime}
        defaultValue={state.runtime}
        id="disable-close-on-select"
        disableClearable
        renderOption={(props, runtime) => {
          return (
            <li {...props}>
              <img
                src={resolveFunctionTaskRuntimeImage(
                  runtime as Workflows.EnumRuntimeEnvironment
                )}
                style={{ width: 24, height: 24, marginRight: 8 }}
              />
              {runtime}
            </li>
          );
        }}
        onChange={(_, value) => {
          if (value !== null) {
            updateState({
              runtime: value,
            });
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Runtime" variant="standard" />
        )}
      />
      <FormHelperText sx={{ m: 0, marginTop: '4px' }}>
        Choose a task runtime
      </FormHelperText>
    </FormControl>
  );
};

const TaskDetailsStep: React.FC = () => {
  const { state, updateState } = useStepperState();

  return (
    <>
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Task Id"
        required
        defaultValue={state.id}
        helperText={'Choose a unique id for this task'}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        onChange={(e) => {
          updateState({ id: e.target.value });
        }}
        style={{ marginTop: '16px' }}
      />
      <TextField
        fullWidth
        size="small"
        margin="dense"
        label="Description"
        multiline
        rows={3}
        defaultValue={state.description}
        helperText={'Describe what this task does'}
        FormHelperTextProps={{
          sx: { m: 0, marginTop: '4px' },
        }}
        onChange={(e) => {
          updateState({ description: e.target.value });
        }}
        style={{ marginTop: '16px' }}
      />
    </>
  );
};

type CreateFunctionTaskModalProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
  open: boolean;
  toggle: () => void;
};

type Task = {
  id: string;
  description?: string;
  runtime: string;
};

const CreateFunctionTaskModal: React.FC<CreateFunctionTaskModalProps> = ({
  open,
  toggle,
  groupId,
  pipeline,
}) => {
  const { create, isLoading, isError, error, isSuccess, reset, invalidate } =
    Hooks.Tasks.useCreate();

  const defaultCode = `# Use the execution context to fetch input data, save data to outputs,\n# and terminate the task with the stdout and stderr functions\nfrom owe_python_sdk.runtime import execution_context as ctx`;

  const createTask = (task: Task) => {
    create(
      {
        groupId: groupId!,
        pipelineId: pipeline.id!,
        reqTask: {
          id: task.id,
          description: task.description ? task.description : '',
          type: Workflows.EnumTaskType.Function,
          runtime: task.runtime as Workflows.EnumRuntimeEnvironment,
          installer: Workflows.EnumInstaller.Pip,
          code: encode(defaultCode),
        },
      },
      {
        onSuccess: () => {
          reset();
          invalidate();
          toggle();
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
        Create a task
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
            runtime: undefined,
            description: undefined,
            id: undefined,
          }}
          backDisabled={isSuccess}
          nextIsLoading={isLoading}
          nextDisabled={isError || isLoading || isSuccess}
          onClickFinish={(state) => {
            if (state.runtime && state.id) {
              createTask({
                id: state.id,
                runtime: state.runtime,
                description: state.description,
              });
            }
          }}
          finishButtonText="create"
          steps={[
            {
              label: 'Task details',
              element: <TaskDetailsStep />,
              nextCondition: (state) => state.id !== undefined,
            },
            {
              label: 'Choose runtime',
              element: <RuntimeStep />,
              nextCondition: (state) => state.runtime !== undefined,
            },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CreateFunctionTaskModal;

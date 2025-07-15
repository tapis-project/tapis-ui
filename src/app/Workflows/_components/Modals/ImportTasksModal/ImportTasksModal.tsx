import React, { useCallback, useMemo } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { LoadingButton as Button } from '@mui/lab';
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

const SelectGroupStep: React.FC = () => {
  const { updateState } = useStepperState();
  const { groups } = useAppSelector((state) => state.workflows);
  return (
    <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
      <Autocomplete
        options={groups}
        getOptionLabel={(option: Workflows.Group) => option.id!}
        id="disable-close-on-select"
        disableClearable
        onChange={(_, value) => {
          if (value !== null) {
            updateState({
              groupId: value.id!,
            });
          }
        }}
        renderInput={(params) => (
          <TextField {...params} label="Group" variant="standard" />
        )}
      />
      <FormHelperText>Choose a group</FormHelperText>
    </FormControl>
  );
};

const SelectPipelineStep: React.FC = () => {
  const { state, updateState } = useStepperState();
  const { data, isLoading, error } = Hooks.Pipelines.useList({
    groupId: state.groupId,
  });

  const pipelines = data?.result ?? [];

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
        <Autocomplete
          options={pipelines}
          getOptionLabel={(option: Workflows.Pipeline) => option.id!}
          id="disable-close-on-select"
          disableClearable
          onChange={(_, value) => {
            if (value !== null) {
              updateState({
                pipelineId: pipelines.filter((p) => p.id === value.id)[0].id,
              });
            }
          }}
          renderInput={(params) => (
            <TextField {...params} label="Pipeline" variant="standard" />
          )}
        />
        <FormHelperText>Choose a pipeline</FormHelperText>
      </FormControl>
    </QueryWrapper>
  );
};

const SelectTasksStep: React.FC = () => {
  const { state, updateState } = useStepperState();
  const { data, isLoading, isSuccess, isError, error } =
    Hooks.Pipelines.useDetails({
      groupId: state.groupId as string,
      pipelineId: state.pipelineId as string,
    });

  const tasks = data?.result?.tasks ?? [];

  const importAllLabel = 'Import all tasks';

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
        <InputLabel size="small" id="mode">
          Tasks
        </InputLabel>
        <Select
          label="Pipeline"
          labelId="mode"
          size="small"
          multiple
          onChange={(e) => {
            const value = e.target.value;
            // On autofill we get a stringified value.
            const selectedTaskIds: Array<string> =
              typeof value === 'string' ? value.split(',') : value;

            let selectedTasks = tasks.filter((t) =>
              selectedTaskIds.includes(t.id!)
            );

            if (selectedTaskIds.includes(importAllLabel)) {
              selectedTasks = tasks.filter(
                (t) => !selectedTaskIds.includes(t.id!)
              );
            }
            updateState({
              selectedTasks,
            });
          }}
          value={
            state?.selectedTasks
              ? state.selectedTasks.map((t: Workflows.Task) => t.id)
              : []
          }
          disabled={tasks.length === 0}
        >
          {tasks.length === 0 ? (
            <MenuItem disabled>No options available</MenuItem>
          ) : (
            <MenuItem value={importAllLabel}>
              <Login style={{ marginRight: '8px' }} /> {importAllLabel}
            </MenuItem>
          )}
          {tasks.map((task: Workflows.Task) => {
            return (
              <MenuItem key={task.id} value={task.id!}>
                {task.id}
              </MenuItem>
            );
          })}
        </Select>
        <FormHelperText>Choose tasks</FormHelperText>
      </FormControl>
    </QueryWrapper>
  );
};

// const RenameTaskIdsStep: React.FC = () => {
//   const { state, updateState } = useStepperState();
//   const resolveErrors = useCallback(
//     (selectedTaskId: string) => {
//       let existsInTarget: boolean = state.targetPipeline.tasks
//         .map((t: Workflows.Task) => t.id)
//         .includes(selectedTaskId);

//       let isDuplicate =
//         state.selectedTasks.filter(
//           (t: Workflows.Task) => t.id === selectedTaskId
//         ).length > 1;

//       return [existsInTarget, isDuplicate];
//     },
//     [state, updateState]
//   );

//   return (
//     <div>
//       {state.selectedTasks.map((task: Workflows.Task) => {
//         let errors = resolveErrors(task.id!);
//         let isError: boolean = errors.some((e) => e);
//         const helperText = () => {
//           if (errors[0]) {
//             return `This pipeline you are importing this task to already has a task with an id of '${task.id}'. Change the id before submitting`;
//           }

//           if (errors[1]) {
//             return `Tasks must have unique ids`;
//           }

//           return `Task '${task.id}' will be imported into the current pipeline with this id `;
//         };
//         return (
//           <div
//             key={`${task.id}`}
//             style={{
//               display: 'flex',
//               flexDirection: 'row',
//               gap: '16px',
//               marginTop: '16px',
//               marginBottom: '16px',
//             }}
//           >
//             <div style={{ flex: 1 }}>
//               <FormControl fullWidth margin="dense">
//                 <TextField
//                   size="small"
//                   variant="outlined"
//                   id="Original Id"
//                   label="Original Id"
//                   disabled
//                   value={task.id}
//                 />
//               </FormControl>
//             </div>
//             <div style={{ flex: 1 }}>
//               <TextField
//                 id="New Id"
//                 label="New Id"
//                 required
//                 fullWidth
//                 margin="dense"
//                 variant="outlined"
//                 size="small"
//                 error={isError}
//                 helperText={helperText()}
//                 FormHelperTextProps={{
//                   style: { color: isError ? 'red' : 'inherit' },
//                 }}
//                 defaultValue={task.id}
//               />
//             </div>
//           </div>
//         );
//       })}
//     </div>
//   );
// };

type ImportTasksModalProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
  open: boolean;
  toggle: () => void;
};

const ImportTasksModal: React.FC<ImportTasksModalProps> = ({
  open,
  toggle,
  groupId,
  pipeline,
}) => {
  const { patch, isLoading, isError, error, isSuccess, invalidate, reset } =
    Hooks.Pipelines.usePatch();

  const batchCreateTasks = (tasks: Array<Workflows.Task>) => {
    patch(
      {
        groupId,
        pipelineId: pipeline.id!,
        reqPatchPipeline: {
          tasks: tasks as Array<Workflows.ReqTask>,
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
      aria-labelledby="Import tasks"
      aria-describedby="A modal for importing tasks from other pipelines"
    >
      <DialogTitle id="alert-dialog-title">
        Import tasks
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
            targetGroupId: groupId,
            targetPipeline: pipeline,
            selectedTasks: [],
            groupId: undefined,
            pipelineId: undefined,
          }}
          backDisabled={isSuccess}
          nextIsLoading={isLoading}
          nextDisabled={isError || isLoading || isSuccess}
          onClickFinish={(state) => {
            if (state.selectedTasks && state.selectedTasks.length > 0) {
              batchCreateTasks(state.selectedTasks);
            }
          }}
          finishButtonText="import"
          steps={[
            {
              label: 'Choose a group',
              element: <SelectGroupStep />,
              nextCondition: (state) => state.groupId !== undefined,
            },
            {
              label: 'Choose a pipeline',
              element: <SelectPipelineStep />,
              nextCondition: (state) => state.pipelineId !== undefined,
            },
            {
              label: 'Choose tasks',
              element: <SelectTasksStep />,
              nextCondition: (state) =>
                state.selectedTasks !== undefined &&
                state.selectedTasks.length > 0,
            },
            // {
            //   label: 'Rename tasks',
            //   element: <RenameTaskIdsStep />,
            //   nextCondition: (state) =>
            //     state.validFields !== undefined &&
            //     state.validFields.length > 0 &&
            //     state.validFields.length === state.selectedTasks.length,
            // },
          ]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImportTasksModal;

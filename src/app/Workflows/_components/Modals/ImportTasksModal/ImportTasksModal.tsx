import React, { useMemo } from 'react';
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
} from '@mui/material';
import { useAppSelector } from '@redux';
import { Close, Login } from '@mui/icons-material';

const SelectGroupStep: React.FC = () => {
  const { state, updateState } = useStepperState();
  const { groups } = useAppSelector((state) => state.workflows);
  return (
    <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
      <InputLabel size="small" id="mode">
        Group
      </InputLabel>
      <Select
        label="Group"
        labelId="mode"
        size="small"
        defaultValue={state.groupId}
        onChange={(e) => {
          updateState({
            groupId: e.target.value,
          });
        }}
      >
        {groups.map((group: Workflows.Group) => {
          return <MenuItem value={group.id!}>{group.id}</MenuItem>;
        })}
      </Select>
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
        <InputLabel size="small" id="mode">
          Pipeline
        </InputLabel>
        <Select
          label="Pipeline"
          labelId="mode"
          size="small"
          defaultValue={state.pipelineId}
          onChange={(e) => {
            updateState({
              pipelineId: pipelines.filter((p) => p.id === e.target.value)[0]
                .id,
            });
          }}
        >
          {pipelines.map((pipeline: Workflows.Pipeline) => {
            return <MenuItem value={pipeline.id!}>{pipeline.id}</MenuItem>;
          })}
        </Select>
        <FormHelperText>Choose a pipeline</FormHelperText>
      </FormControl>
    </QueryWrapper>
  );
};

const SelectTasksStep: React.FC = () => {
  const { state, updateState } = useStepperState();
  const { data, isLoading, error } = Hooks.Pipelines.useDetails({
    groupId: state.groupId as string,
    pipelineId: state.pipelineId as string,
  });

  const importAllLabel = 'Import all tasks';

  const importAll = useMemo(
    () =>
      state?.selectedTasks === undefined
        ? false
        : state.selectedTasks.includes(importAllLabel),
    [state, updateState]
  );

  const tasks = data?.result?.tasks ?? [];

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
            let value = e.target.value;
            updateState({
              // On autofill we get a stringified value.
              selectedTasks:
                typeof value === 'string' ? value.split(',') : value,
            });
          }}
          value={state?.selectedTasks || []}
          disabled={tasks.length === 0}
        >
          {tasks.length === 0 ? (
            <MenuItem disabled>-- No tasks available to import--</MenuItem>
          ) : (
            <MenuItem value={importAllLabel}>
              <Login style={{ marginRight: '8px' }} /> {importAllLabel}
            </MenuItem>
          )}
          {tasks.map((task: Workflows.Task) => {
            return (
              <MenuItem
                key={task.id}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: importAll ? '#FFCCCB' : '#E5EEFA',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: importAll ? '#FFCCCB' : '#E5EEFA',
                  },
                }}
                value={task.id!}
              >
                {importAll && 'except '}
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
  const { create, isLoading, error } = Hooks.Tasks.useCreate();

  const createTask = (task: Workflows.Task) => {
    create(
      {
        groupId,
        pipelineId: pipeline.id!,
        reqTask: {
          ...(task as any),
        },
      },
      {
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
      aria-describedby="A modal for copying tasks from other pipelines"
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
        <MUIStepper
          initialState={{
            targetGroupId: groupId,
            targetPipeline: pipeline,
            selectedTasks: [],
            groupId: undefined,
            pipelineId: undefined,
          }}
          onClickFinish={(state) => {
            state.selectedTasks.map((taskId: string) => {
              console.log({ taskId });
            });
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
          ]}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImportTasksModal;

import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './EnvTab.module.scss';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
} from '@mui/material';
import { usePatchTask } from 'app/Workflows/_hooks';

type TabProps = {
  groupId: string;
  pipeline: Workflows.Pipeline;
};

const EnvTab: React.FC<TabProps> = ({ groupId, pipeline }) => {
  return (
    <div className={styles['form']}>
      {JSON.stringify(pipeline.env)}
      {/* <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
        <InputLabel size="small" id="mode">
          Task invocation mode
        </InputLabel>
        <Select
          label="Task invocation mode"
          labelId="mode"
          size="small"
          defaultValue={(taskPatch as any).execution_profile.invocation_mode}
          onChange={(e) => {
            setTaskPatch(
              task,
              {
                execution_profile: {
                  ...taskPatch.execution_profile,
                  invocation_mode: (e.target.value as Workflows.EnumInvocationMode)
                }
              }
            )
          }}
        >
          {Object.values(Workflows.EnumInvocationMode).map((mode) => {
            return (
              <MenuItem
                selected={mode === (taskPatch as any).execution_profile.invocation_mode}
                value={mode}
                disabled={mode === Workflows.EnumInvocationMode.Sync}
              >
                {mode}{mode === Workflows.EnumInvocationMode.Sync ? " - unavailable" : ""}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormHelperText>Excute tasks asynchronously or serially</FormHelperText>
      <FormControl
        fullWidth
        margin="normal"
        style={{ marginBottom: '-16px' }}
      >
        <InputLabel size="small" id="retrypolicy">
          Retry policy
        </InputLabel>
        <Select
          label="Retry Policy"
          onChange={(e) => {
            setTaskPatch(
              task,
              {
                execution_profile: {
                  ...taskPatch.execution_profile,
                  retry_policy: (e.target.value as Workflows.EnumRetryPolicy)
                }
              }
            )
          }}
          labelId="retrypolicy"
          size="small"
          defaultValue={taskPatch.execution_profile?.retry_policy}
        >
          {Object.values(Workflows.EnumRetryPolicy).map((policy) => {
            return (
              <MenuItem
                selected={policy === task.execution_profile?.retry_policy}
                value={policy}
              >
                {policy}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormHelperText>
        Controls how soon to retry a task once it enters a failed state
      </FormHelperText>
      <FormControl
        fullWidth
        margin="normal"
        style={{ marginBottom: '-16px' }}
      >
        <InputLabel size="small" id="flavor">
          Flavor
        </InputLabel>
        <Select
          label="Flavor"
          labelId="flavor"
          size="small"
          defaultValue={taskPatch.execution_profile?.flavor}
          onChange={(e) => {
            setTaskPatch(
              task,
              {
                execution_profile: {
                  ...taskPatch.execution_profile,
                  flavor: (e.target.value as Workflows.EnumTaskFlavor)
                }
              }
            )
          }}
        >
          {Object.values(Workflows.EnumTaskFlavor).map((flavor) => {
            return (
              <MenuItem
                selected={flavor === task.execution_profile?.flavor}
                value={flavor}
              >
                {flavor}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
      <FormHelperText>
        How many cpus/gpus, and how much memory and disk available to this
        task
      </FormHelperText>
      <TextField
        defaultValue={taskPatch.execution_profile?.max_retries || 0}
        size="small"
        margin="normal"
        style={{ marginBottom: '-16px' }}
        label="Max retries"
        variant="outlined"
        type="number"
        onChange={(e) => {
          setTaskPatch(
            task,
            {
              execution_profile: {
                ...taskPatch.execution_profile,
                max_retries: parseInt(e.target.value)
              }
            }
          )
        }}
      />
      <FormHelperText>
        Maximum number of times this task will execute after failing once
      </FormHelperText>
      <TextField
        defaultValue={taskPatch.execution_profile?.max_exec_time || 86400}
        size="small"
        margin="normal"
        style={{ marginBottom: '-16px' }}
        label="Max exec time (sec)"
        variant="outlined"
        type="number"
        onChange={(e) => {
          setTaskPatch(
            task,
            {
              execution_profile: {
                ...taskPatch.execution_profile,
                max_exec_time: parseInt(e.target.value)
              }
            }
          )
        }}
      />
      <FormHelperText>
        Max time in seconds this task is permitted to run
      </FormHelperText> */}
    </div>
  );
};

export default EnvTab;

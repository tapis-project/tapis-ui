import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './ExecutionProfileTab.module.scss';
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  FormHelperText,
} from '@mui/material';
import { Sidebar } from '../../../Sidebar';
import { usePatchTask } from 'app/Workflows/_hooks';

const ExecutionProfileTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { task, taskPatch } = usePatchTask<Workflows.Task>();
  return (
    <Sidebar title={'Execution Profile'} toggle={toggle}>
      <div className={styles['form']}>
        <FormControl fullWidth margin="dense" style={{ marginBottom: '-16px' }}>
          <InputLabel size="small" id="mode">
            Task invocation mode
          </InputLabel>
          <Select
            label="Task invocation mode"
            labelId="mode"
            size="small"
            defaultValue={(taskPatch as any).invocation_mode}
          >
            {Object.values(Workflows.EnumInvocationMode).map((mode) => {
              return (
                <MenuItem
                  selected={mode === (taskPatch as any).invocation_mode}
                  value={mode}
                >
                  {mode}
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
            onChange={() => {}}
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
        />
        <FormHelperText>
          Max time in seconds this task is permitted to run
        </FormHelperText>
      </div>
    </Sidebar>
  );
};

export default ExecutionProfileTab;

import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './GeneralTab.module.scss';
import { Box, TextField } from '@mui/material';
import { Sidebar } from '../../../Sidebar';
import { usePatchTask } from 'app/Workflows/_hooks';

const GeneralTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { task, taskPatch, setTaskPatch } = usePatchTask<Workflows.Task>();
  return (
    <Sidebar title={'General'} toggle={toggle}>
      <Box
        component="form"
        className={styles['form']}
        noValidate
        autoComplete="off"
      >
        <TextField
          label="Id"
          size="small"
          variant="outlined"
          disabled
          value={task.id}
        />
        <TextField
          label="Type"
          disabled
          size="small"
          variant="outlined"
          value={task.type}
        />
        <TextField
          label="Description"
          variant="outlined"
          multiline
          rows={4}
          defaultValue={taskPatch.description}
          onChange={(e) => {
            setTaskPatch(task, { description: e.target.value });
          }}
        />
      </Box>
    </Sidebar>
  );
};

export default GeneralTab;

import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './DependenciesTab.module.scss';
import { Sidebar } from '../../../Sidebar';
import { usePatchTask } from 'app/Workflows/_hooks';
import { FormGroup, FormControlLabel, Checkbox, Tooltip } from '@mui/material';
import { ErrorOutline } from '@mui/icons-material';

const DependenciesTab: React.FC<{ toggle: () => void }> = ({ toggle }) => {
  const { task, tasks, taskPatch, setTaskPatch } =
    usePatchTask<Workflows.Task>();
  const handleUpdateDep = (taskId: string, action: 'add' | 'remove') => {
    if (action === 'add') {
      // TODO handle for can_fail and can_skip
      setTaskPatch(task, {
        depends_on: [
          ...taskPatch.depends_on!,
          { id: taskId, can_fail: false, can_skip: false },
        ],
      });
      return;
    }

    if (action === 'remove') {
      setTaskPatch(task, {
        depends_on: [
          ...taskPatch.depends_on!.filter((dep) => dep.id !== taskId),
        ],
      });
      return;
    }
  };

  const otherTasks = tasks.filter((t) => t.id !== task.id);
  const otherTaskIds = tasks.map((t) => t.id);
  const missingTaskDeps = (task.depends_on || []).filter(
    (dep) => !otherTaskIds.includes(dep.id)
  );

  return (
    <Sidebar title={'Dependencies'} toggle={toggle}>
      <FormGroup className={styles['form']}>
        {otherTasks.map((dep) => {
          return (
            <FormControlLabel
              style={{ padding: 0 }}
              control={
                <Checkbox
                  defaultChecked={
                    taskPatch.depends_on!.filter((t) => t.id === dep.id)
                      .length > 0
                  }
                  style={{ padding: 0 }}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      handleUpdateDep(e.target.value, 'add');
                      return;
                    }
                    handleUpdateDep(e.target.value, 'remove');
                  }}
                  value={dep.id}
                />
              }
              label={dep.id}
            />
          );
        })}
        {missingTaskDeps.map((dep) => {
          return (
            <FormControlLabel
              style={{ padding: 0 }}
              control={
                <Checkbox
                  defaultChecked={true}
                  style={{ padding: 0 }}
                  onChange={(e: any) => {
                    if (e.target.checked) {
                      handleUpdateDep(e.target.value, 'add');
                      return;
                    }
                    handleUpdateDep(e.target.value, 'remove');
                  }}
                  value={dep.id}
                />
              }
              label={
                <Tooltip
                  title={`Task '${dep.id}' does not exist but is still being referenced as a dependency`}
                >
                  <span key={`missing-dep-${dep.id}`}>
                    <ErrorOutline
                      sx={{
                        marginRight: '4px',
                        marginLeft: '4px',
                        color: 'red',
                      }}
                    />
                    {dep.id}
                  </span>
                </Tooltip>
              }
            />
          );
        })}
      </FormGroup>
    </Sidebar>
  );
};

export default DependenciesTab;

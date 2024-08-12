import React from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
import {
  ListItemText,
  ListItemIcon,
  Divider,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
} from '@mui/material';
import { Add, Publish } from '@mui/icons-material';

type DagViewDrawerProps = {
  groupId: string;
  pipelineId: string;
  toggle: () => void;
  open: boolean;
  onClickCreateTask: () => void;
  onClickRunPipeline: () => void;
};

const DagViewDrawer: React.FC<DagViewDrawerProps> = ({
  groupId,
  pipelineId,
  toggle,
  open,
  onClickCreateTask,
  onClickRunPipeline,
}) => {
  const { extension } = useExtension();
  const { create } = Hooks.Tasks.useCreate();

  const handleCreateDagTask = (task: Workflows.FunctionTask) => {
    create(
      {
        groupId,
        pipelineId,
        reqTask: {
          ...task,
          id: task.id!,
          type: Workflows.EnumTaskType.Function,
          runtime: task.runtime!,
          installer: task.installer!,
          code: task.code! || undefined,
        },
      },
      {
        onSuccess: toggle,
      }
    );
  };

  const sidebarTasks =
    extension?.serviceCustomizations?.workflows?.dagTasks || [];
  return (
    <div>
      <Drawer open={open} onClose={toggle} anchor="top">
        <Box role="presentation" onClick={toggle}>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={onClickRunPipeline}>
                <ListItemIcon>
                  <Publish />
                </ListItemIcon>
                <ListItemText
                  primary={'Run Pipeline'}
                  secondary={`Run pipeline '${pipelineId}'`}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={onClickCreateTask}>
                <ListItemIcon>
                  <Add />
                </ListItemIcon>
                <ListItemText
                  primary={'New Task'}
                  secondary="Add a new task to the graph"
                />
              </ListItemButton>
            </ListItem>
          </List>
          <Divider />
          <List
            subheader={
              <ListSubheader
                component="div"
                id="predefined-tasks"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                Add predefined tasks to the workflow
              </ListSubheader>
            }
          >
            {sidebarTasks.map((task, i) => (
              <ListItem key={`dag-task-${i}`} disablePadding>
                <ListItemButton
                  onClick={() => {
                    console.log({ task });
                    handleCreateDagTask(task as Workflows.Task);
                  }}
                >
                  <ListItemIcon>
                    <Add />
                  </ListItemIcon>
                  <ListItemText
                    primary={task.id}
                    secondary={task.description || ''}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </div>
  );
};

export default DagViewDrawer;

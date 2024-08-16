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
  onError?: () => void;
};

const DagViewDrawer: React.FC<DagViewDrawerProps> = ({
  groupId,
  pipelineId,
  toggle,
  open,
  onClickCreateTask,
  onClickRunPipeline,
  onError,
}) => {
  const { extension, extensionName, services } = useExtension();
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
        onError: (e) => {
          console.log(e.message);
        },
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
          {sidebarTasks && (
            <>
              <Divider />
              <List
                subheader={
                  <ListSubheader
                    component="div"
                    id="predefined-tasks-extension"
                    onClick={(event) => {
                      event.stopPropagation();
                    }}
                  >
                    Predefined tasks from the {extensionName} extension
                  </ListSubheader>
                }
              >
                {sidebarTasks.map((task, i) => (
                  <ListItem key={`dag-task-extension-${i}`} disablePadding>
                    <ListItemButton
                      onClick={() => {
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
            </>
          )}
          <Divider />
          <List
            subheader={
              <ListSubheader
                component="div"
                id="predefined-tasks-core"
                onClick={(event) => {
                  event.stopPropagation();
                }}
              >
                Predefined tasks from the Tapis extension
              </ListSubheader>
            }
          >
            {services?.workflows.tasks.map((task, i) => (
              <ListItem key={`dag-task-core-${i}`} disablePadding>
                <ListItemButton
                  onClick={() => {
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

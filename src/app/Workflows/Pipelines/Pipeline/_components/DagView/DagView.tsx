import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { Icon } from '@tapis/tapisui-common';
import { useExtension } from 'extensions';
import styles from './DagView.module.scss';
import { Button } from 'reactstrap';
import Tooltip from '@mui/material/Tooltip';
import { useCallback, useEffect, useReducer } from 'react';
import { useQueryClient } from 'react-query';
import { TaskEditor } from '../../../_components';
import {
  MenuList,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
} from '@mui/material';
import {
  Delete,
  Edit,
  Hub,
  Input,
  Output,
  Visibility,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';

type NodeTaskActionProps = {
  onClickEdit?: () => void;
  onClickDelete?: () => void;
  task: Workflows.Task;
};

const NodeTaskActions: React.FC<NodeTaskActionProps> = ({
  onClickEdit,
  onClickDelete,
  task,
}) => {
  const location = useLocation();
  return (
    <Paper
      sx={{ width: 320, maxWidth: '100%' }}
      className={styles['dag-task-action-menu']}
    >
      <MenuList dense>
        <MenuItem
          href={'#' + location.pathname + '/tasks/' + task.id}
          component="a"
        >
          <ListItemIcon>
            <Visibility fontSize="small" />
          </ListItemIcon>
          <ListItemText>View</ListItemText>
        </MenuItem>
        <MenuItem onClick={onClickEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem>
          <ListItemIcon>
            <Hub fontSize="small" />
          </ListItemIcon>
          <ListItemText>Dependencies</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Input fontSize="small" />
          </ListItemIcon>
          <ListItemText>Input</ListItemText>
        </MenuItem>
        <MenuItem>
          <ListItemIcon>
            <Output fontSize="small" />
          </ListItemIcon>
          <ListItemText>Output</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={onClickDelete}>
          <ListItemIcon>
            <Delete fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </MenuList>
    </Paper>
  );
};

type DagViewProps = {
  tasks: Array<Workflows.Task>;
  pipelineId: string;
  groupId: string;
};

type State = {
  tasks: Array<Workflows.Task>;
  selectedTask?: Workflows.Task | undefined;
  editTask?: Workflows.Task | undefined;
};

enum EnumActionType {
  ADD_TASK,
  DELETE_TASK,
  SELECT_TASK,
  EDIT_TASK,
}

type Action = {
  type: EnumActionType;
  payload: Workflows.Task;
};

const reducer = (state: State, action: Action) => {
  switch (action.type) {
    case EnumActionType.ADD_TASK:
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
      };

    case EnumActionType.DELETE_TASK:
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload.id),
      };
    case EnumActionType.SELECT_TASK:
      let selectedTask: Workflows.Task | undefined = action.payload;
      if (state.selectedTask && selectedTask.id === state.selectedTask.id) {
        selectedTask = undefined;
      }
      return {
        ...state,
        selectedTask,
      };
    case EnumActionType.EDIT_TASK:
      let editTask: Workflows.Task | undefined = action.payload;
      if (state.editTask && editTask.id === state.editTask.id) {
        editTask = undefined;
      }
      return {
        ...state,
        editTask,
      };
    default:
      return state;
  }
};

const initialReducerState = {
  tasks: [],
  selectedTask: undefined,
};

const DagView: React.FC<DagViewProps> = ({ groupId, pipelineId, tasks }) => {
  const [state, dispatch] = useReducer(reducer, initialReducerState);
  useEffect(() => {
    const taskIdsInState = state.tasks.map((t) => t.id);
    tasks.map((task) => {
      if (!taskIdsInState.includes(task.id)) {
        dispatch({ type: EnumActionType.ADD_TASK, payload: task });
      }
    });
  }, [tasks]);

  const { extension } = useExtension();
  const queryClient = useQueryClient();

  const sidebarTasks =
    extension?.serviceCustomizations?.workflows?.dagTasks || [];

  const {
    create,
    isLoading: createTaskIsLoading,
    isError: createTaskIsError,
    error: createTaskError,
    reset: createTaskReset,
  } = Hooks.Tasks.useCreate();

  const onSuccessCreateTask = useCallback(() => {
    queryClient.invalidateQueries(Hooks.Tasks.queryKeys.list);
    createTaskReset();
  }, [queryClient, createTaskReset]);

  const {
    removeAsync,
    isLoading: deleteTaskIsLoading,
    isError: deleteTaskIsError,
    error: deleteTaskError,
    isSuccess: deleteTaskIsSuccess,
    reset: deleteTaskReset,
  } = Hooks.Tasks.useDelete();

  const onSuccessDeleteTask = useCallback(() => {
    queryClient.invalidateQueries(Hooks.Tasks.queryKeys.list);
    deleteTaskReset();
  }, [queryClient, deleteTaskReset]);

  const handleEditTask = (task: Workflows.Task) => {
    // Unselect a task if selected
    if (state.selectedTask) {
      dispatch({
        type: EnumActionType.SELECT_TASK,
        payload: state.selectedTask,
      });
    }
    dispatch({ type: EnumActionType.EDIT_TASK, payload: task });
  };

  const handleCreateTask = (task: Workflows.Task) => {
    // Unselect a task if selected
    if (state.selectedTask) {
      dispatch({
        type: EnumActionType.SELECT_TASK,
        payload: state.selectedTask,
      });
    }

    const taskIdsInState = state.tasks.map((t) => t.id);
    let i = 1;
    let taskId = task.id;
    while (taskIdsInState.includes(task.id)) {
      i++;
      if (!taskIdsInState.includes(taskId + `${i}`)) {
        break;
      }
    }
    taskId = i == 1 ? taskId : taskId + `${i}`;
    task = { ...task, id: taskId };
    dispatch({ type: EnumActionType.ADD_TASK, payload: task });
    switch (task.type) {
      case Workflows.EnumTaskType.Function:
        create(
          {
            groupId,
            pipelineId,
            reqTask: {
              ...task,
              runtime: task.runtime!,
              installer: task.installer!,
              code: task.code! || undefined,
            },
          },
          {
            onSuccess: onSuccessCreateTask,
            onError: () => {
              dispatch({ type: EnumActionType.DELETE_TASK, payload: task });
            },
          }
        );
    }
  };

  const handleDeleteTask = (task: Workflows.Task) => {
    dispatch({ type: EnumActionType.DELETE_TASK, payload: task });
    removeAsync(
      { groupId, pipelineId, taskId: task.id },
      {
        onSuccess: onSuccessDeleteTask,
        onError: () => {
          dispatch({ type: EnumActionType.ADD_TASK, payload: task });
        },
      }
    );
  };

  const handleSelectTask = (task: Workflows.Task) => {
    dispatch({ type: EnumActionType.SELECT_TASK, payload: task });
  };

  return (
    <div id="dag-view" className={`${styles['dag-view-container']}`}>
      {state.editTask ? (
        <TaskEditor
          task={state.editTask}
          tasks={tasks}
          toggle={() => {
            handleEditTask(state.editTask!);
          }}
        />
      ) : (
        <div className={`${styles['dag-layout-container']}`}>
          <div id="dag-sidebar" className={`${styles['sidebar']}`}>
            {sidebarTasks.map((task) => {
              return (
                <Tooltip title={task.description || task.id} placement="left">
                  <div className={`${styles['sidebar-item']}`}>
                    <div className={`${styles['task-info']}`}>
                      <b className={`${styles['task-info-text']}`}>{task.id}</b>
                    </div>
                    <Button
                      onClick={() => {
                        handleCreateTask(task);
                      }}
                      className={`${styles['add-button']}`}
                    >
                      <Icon name={'add'}></Icon>
                    </Button>
                  </div>
                </Tooltip>
              );
            })}
          </div>
          <div className={`${styles['dag-container']}`}>
            <div className={`${styles['dag']}`}>
              {createTaskIsError && 'ERROR:' + createTaskError?.message}
              {deleteTaskIsError && 'ERROR:' + deleteTaskError?.message}
              {state.tasks.map((task) => {
                let classNames = `${styles['dag-task']}`;
                let isActive =
                  state.selectedTask && state.selectedTask.id == task.id;
                if (isActive) {
                  classNames += ' ' + styles['dag-task-active'];
                }
                return (
                  <>
                    <Tooltip
                      title={task.description || task.id}
                      placement="right"
                    >
                      <div
                        className={classNames}
                        onClick={() => {
                          handleSelectTask(task);
                        }}
                      >
                        {task.id}
                      </div>
                    </Tooltip>
                    {isActive && (
                      <NodeTaskActions
                        task={task}
                        onClickDelete={() => {
                          handleDeleteTask(task);
                        }}
                        onClickEdit={() => {
                          handleEditTask(task);
                        }}
                      />
                    )}
                  </>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DagView;

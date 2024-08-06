import React, { useState, useMemo } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';
import { decode, encode } from 'base-64';
import styles from './FunctionTaskEditor/FunctionTaskEditor.module.scss';
import {
  Delete,
  ArrowBack,
  Update,
  Info,
  Hub,
  CompareArrows,
  GitHub,
  Tune,
  Memory,
  Fullscreen,
  FullscreenExit,
} from '@mui/icons-material';
import { LoadingButton as Button, TabContext, TabList } from '@mui/lab';
import {
  // Button,
  Box,
  TextField,
  Checkbox,
  FormGroup,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Tab,
  Chip,
  Stack,
  Snackbar,
  Alert,
  AlertTitle,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import { CodeTab } from './Tabs';
import { TaskUpdateContext } from 'app/Workflows/_context';

type SidebarProps = {
  title: string;
  toggle: () => void;
};

const Sidebar: React.FC<React.PropsWithChildren<SidebarProps>> = ({
  children,
  title,
  toggle,
}) => {
  return (
    <div className={styles['sidebar']}>
      <div className={styles['menu']}>
        <h2>{title}</h2>
        <ArrowBack onClick={toggle} className={styles['back']} />
      </div>
      {children}
    </div>
  );
};

type Tab = "general" | "deps" | "io" | "execprofile" | "runtime" | "git" | "conditions" | "code" | "jobdef"

type TaskEditorProps = {
  groupId: string;
  pipelineId: string;
  task: Workflows.Task;
  tasks: Array<Workflows.Task>;
  tabs: Array<Tab>
  defaultTab?: Tab;
  featuredTab?: Tab
};

const TaskEditor: React.FC<TaskEditorProps> = ({
  groupId,
  pipelineId,
  task,
  tasks,
  tabs = [],
  defaultTab = 'general',
  featuredTab
}) => {
  const initialTaskData = JSON.parse(JSON.stringify(task));
  const [modal, setModal] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<string>(defaultTab);
  const [taskPatch, setTaskPatch] =
    useState<Partial<Workflows.FunctionTask>>(initialTaskData);
  const { patch, isLoading, isSuccess, isError, error, reset } =
    Hooks.Tasks.usePatch();

  const patchTask = (task: Workflows.Task, data: Partial<Workflows.Task>) => {
    setTaskPatch({
      ...task,
      ...data,
    });
  };

  const packageConverter = (
    packages: Array<string> | string,
    reverse = false
  ) => {
    if (!reverse) {
      let packageString = '';
      (packages as Array<string>).map((name) => {
        packageString += name + '\n';
      });

      return packageString;
    }

    const splitPackages = (packages as string)
      .replace(/^\s+|\s+$/g, '')
      .replace(/\s/g, ' ')
      .split(' ');
    return splitPackages;
  };

  const handlePatch = () => {
    patch({
      groupId,
      pipelineId,
      taskId: task.id!,
      task: taskPatch as Workflows.Task,
    });
  };

  const handleChangeTab = (_: React.SyntheticEvent, tab: string) => {
    setTab(tab);
  };

  const dependentTasks = useMemo(() => {
    return tasks.filter((t) => {
      for (let dep of t.depends_on!) {
        if (dep.id === task.id) {
          return true;
        }
      }
      return false;
    });
  }, [task, tasks, taskPatch]);

  const handleUpdateDep = (taskId: string, action: 'add' | 'remove') => {
    if (action === 'add') {
      // TODO handle for can_fail and can_skip
      patchTask(task, {
        depends_on: [
          ...taskPatch.depends_on!,
          { id: taskId, can_fail: false, can_skip: false },
        ],
      });
      return;
    }

    if (action === 'remove') {
      patchTask(task, {
        depends_on: [
          ...taskPatch.depends_on!.filter((dep) => dep.id !== taskId),
        ],
      });
      return;
    }
  };

  return (
    <TaskUpdateContext.Provider value={{setTaskPatch: patchTask, taskPatch, task, tasks, groupId, pipelineId}}>
      <div>
        <Box sx={{ width: '100%', typography: 'body1' }}>
          <TabContext value={tab}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={handleChangeTab}>
                <Tab label="General" value="general" />
                <Tab label="I/O" value="io" />
                <Tab label="Exec. Profile" value="execprofile" />
                <Tab label="Dependencies" value="deps" />
                <Tab label="Runtime" value="runtime" />
                <Tab label="Repos" value="git" />
                <Tab label="Code" value="code" />
              </TabList>
            </Box>
          </TabContext>
        </Box>
        {isError && error && (
          <Alert
            severity="error"
            style={{ marginTop: '8px' }}
            onClose={() => {
              reset();
            }}
          >
            <AlertTitle>Error</AlertTitle>
            {error.message}
          </Alert>
        )}
        {isSuccess && (
          <Snackbar
            open={true}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          >
            <Alert
              severity="success"
              style={{ marginTop: '8px' }}
              onClose={() => {
                reset();
              }}
            >
              Task {task.id} updated successfully
            </Alert>
          </Snackbar>
        )}
        <Stack
          direction="row"
          spacing={'8px'}
          alignItems="flex-start"
          justifyContent={'flex-end'}
        >
          <Button
            size="small"
            variant="outlined"
            onClick={handlePatch}
            loading={isLoading}
            disabled={isLoading}
            style={{ marginBottom: '8px', marginTop: '8px' }}
            startIcon={<Update />}
          >
            Update
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={() => {
              setModal('delete');
            }}
            disabled={isLoading}
            style={{ marginBottom: '8px', marginTop: '8px' }}
            startIcon={<Delete />}
          >
            Delete
          </Button>
        </Stack>
        <div className={styles['container']}>
          {tab === 'general' && (
            <Sidebar
              title={'General'}
              toggle={() => {
                setTab('code');
              }}
            >
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
                    patchTask(task, { description: e.target.value });
                  }}
                />
              </Box>
            </Sidebar>
          )}
          {tab === 'deps' && (
            <Sidebar
              title={'Dependencies'}
              toggle={() => {
                setTab('code');
              }}
            >
              <FormGroup className={styles['form']}>
                {tasks.map((dep) => {
                  if (dep.id === task.id) {
                    return;
                  }
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
                          onChange={(e) => {
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
              </FormGroup>
            </Sidebar>
          )}
          {tab === 'io' && (
            <Sidebar
              title={'Inputs & Outputs'}
              toggle={() => {
                setTab('code');
              }}
            >
              {Object.entries(task.input || {}).map((k, v) => {
                return `${k}:${v}`;
              })}
            </Sidebar>
          )}
          {tab === 'execprofile' && (
            <Sidebar
              title={'Execution Profile'}
              toggle={() => {
                setTab('code');
              }}
            >
              <div className={styles['form']}>
                <FormControl
                  fullWidth
                  margin="dense"
                  style={{ marginBottom: '-16px' }}
                >
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
                <FormHelperText>
                  Excute tasks asynchronously or serially
                </FormHelperText>
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
                          selected={
                            policy === task.execution_profile?.retry_policy
                          }
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
                  How many cpus/gpus, and how much memory and disk available to
                  this task
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
                  Maximum number of times this task will execute after failing
                  once
                </FormHelperText>
                <TextField
                  defaultValue={
                    taskPatch.execution_profile?.max_exec_time || 86400
                  }
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
          )}
          {tab === 'runtime' && (
            <Sidebar
              title={'Runtime'}
              toggle={() => {
                setTab('code');
              }}
            >
              <div className={styles['form']}>
                <FormControl
                  fullWidth
                  margin="dense"
                  style={{ marginBottom: '-16px' }}
                >
                  <InputLabel size="small" id="environment">
                    Runtime environment
                  </InputLabel>
                  <Select
                    size="small"
                    label="Runtime environment"
                    labelId="environment"
                    defaultValue={taskPatch.runtime}
                    onChange={(e) => {
                      patchTask(task, {
                        runtime: e.target
                          .value as Workflows.EnumRuntimeEnvironment,
                      });
                    }}
                  >
                    {Object.values(Workflows.EnumRuntimeEnvironment).map(
                      (runtimeEnv) => {
                        return (
                          <MenuItem
                            value={runtimeEnv}
                            selected={runtimeEnv === task.runtime!}
                          >
                            {runtimeEnv}
                          </MenuItem>
                        );
                      }
                    )}
                  </Select>
                </FormControl>
                <FormHelperText>
                  The runtime envrionment in which the function code will be
                  executed
                </FormHelperText>
                <TextField
                  label="Packages"
                  variant="outlined"
                  multiline
                  rows={4}
                  defaultValue={packageConverter(taskPatch.packages || [])}
                  margin="normal"
                  style={{ marginBottom: '-16px' }}
                  onChange={(e) => {
                    patchTask(task, {
                      packages: packageConverter(
                        e.target.value,
                        true
                      ) as Array<string>,
                    });
                  }}
                />
                <FormHelperText>
                  Each package must be on a seperate line. May be just the package
                  name or the pacakge name followed by the version. Ex.
                  tapipy==^1.6.0
                </FormHelperText>
                <FormControl
                  fullWidth
                  margin="normal"
                  style={{ marginBottom: '-16px' }}
                >
                  <InputLabel size="small" id="installer">
                    Installer
                  </InputLabel>
                  <Select
                    size="small"
                    label="Installer"
                    defaultValue={taskPatch.installer}
                    onChange={(e) => {
                      patchTask(task, {
                        installer: e.target.value as Workflows.EnumInstaller,
                      });
                    }}
                  >
                    {Object.values(Workflows.EnumInstaller).map((installer) => {
                      return (
                        <MenuItem
                          selected={installer === task.installer}
                          value={installer}
                        >
                          {installer}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
                <FormHelperText>
                  Choose which installer to use to install the packages above
                </FormHelperText>
              </div>
            </Sidebar>
          )}
          {tab === 'git' && (
            <Sidebar
              title={'Git Repositories'}
              toggle={() => {
                setTab('code');
              }}
            >
              Test
            </Sidebar>
          )}
          <CodeTab
            featured={task.type === Workflows.EnumTaskType.Function}
          />
            
        </div>
        <Dialog
          open={modal === 'delete'}
          onClose={() => {}}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Delete task?</DialogTitle>
          <DialogContent>
            {dependentTasks.length > 0 && (
              <Alert severity="warning" style={{ marginBottom: '8px' }}>
                This task is required by {dependentTasks.length} other task
                {dependentTasks.length > 1 ? 's' : ''} in this pipeline: [{' '}
                {dependentTasks.map((d) => `${d.id} `)}].
                <br />
                Running this workflow after this task is deleted will result in an
                immediate failure.
              </Alert>
            )}
            <DialogContentText id="alert-dialog-description">
              Deleting a task is an irrevocable action. Are you sure you want to
              continue?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setModal(undefined);
              }}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={() => {
                setModal(undefined);
              }}
              autoFocus
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </TaskUpdateContext.Provider>
  );
};

export default TaskEditor;

import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './TaskEditor.module.scss';
import { Delete, Save } from '@mui/icons-material';
import { LoadingButton as Button, TabContext, TabList } from '@mui/lab';
import {
  // Button,
  Box,
  Tab,
  Stack,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material';
import {
  CodeTab,
  GitTab,
  GeneralTab,
  DependenciesTab,
  RuntimeTab,
  ExecutionProfileTab,
  TapisJobDefTab,
  ConditionsTab,
  IOTab,
  BuilderTab,
  ContextTab,
  DestinationTab,
} from './Tabs';
import { usePatchTask } from 'app/Workflows/_hooks';
import { DeleteTaskModal } from 'app/Workflows/_components/Modals';
import { useHistory } from 'react-router-dom';

type Tab =
  | 'general'
  | 'deps'
  | 'io'
  | 'execprofile'
  | 'runtime'
  | 'git'
  | 'conditions'
  | 'code'
  | 'jobdef'
  | 'context'
  | 'destination'
  | 'builder'
  | 'uses'
  | 'image';

type TaskEditorProps = {
  groupId: string;
  pipelineId: string;
  task: Workflows.Task;
  tasks: Array<Workflows.Task>;
  tabs: Array<Tab>;
  defaultTab?: Tab;
  featuredTab?: Tab;
};

const TaskEditor: React.FC<TaskEditorProps> = ({
  tabs = [],
  defaultTab = 'general',
  featuredTab,
}) => {
  const [modal, setModal] = useState<string | undefined>(undefined);
  const [tab, setTab] = useState<string>(defaultTab);
  const {
    task,
    groupId,
    pipelineId,
    commit,
    isLoading,
    isError,
    isSuccess,
    error,
    reset,
    dirty,
  } = usePatchTask<Workflows.Task>();
  const history = useHistory();

  const handleChangeTab = (_: React.SyntheticEvent, tab: string) => {
    setTab(tab);
  };

  return (
    <div>
      <Box sx={{ width: '100%', typography: 'body1' }}>
        <TabContext value={tab}>
          <Box>
            <TabList onChange={handleChangeTab}>
              {tabs.includes('general') && (
                <Tab label="General" value="general" />
              )}
              {tabs.includes('conditions') && (
                <Tab label="Conditions" value="conditions" />
              )}
              {tabs.includes('io') && <Tab label="I/O" value="io" />}
              {tabs.includes('execprofile') && (
                <Tab label="Exec. Profile" value="execprofile" />
              )}
              {tabs.includes('deps') && (
                <Tab label="Dependencies" value="deps" />
              )}
              {tabs.includes('uses') && (
                <Tab label="Inheritance" value="uses" />
              )}
              {tabs.includes('runtime') && (
                <Tab label="Runtime" value="runtime" />
              )}
              {tabs.includes('git') && <Tab label="Repos" value="git" />}
              {tabs.includes('code') && <Tab label="Code" value="code" />}
              {tabs.includes('builder') && (
                <Tab label="Builder" value="builder" />
              )}
              {tabs.includes('context') && (
                <Tab label="Source" value="context" />
              )}
              {tabs.includes('destination') && (
                <Tab label="Destination" value="destination" />
              )}
              {tabs.includes('jobdef') && <Tab label="Job" value="jobdef" />}
              {tabs.includes('image') && <Tab label="Image" value="image" />}
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
        style={{ paddingRight: '8px' }}
      >
        <Button
          size="small"
          variant="outlined"
          onClick={commit}
          loading={isLoading}
          disabled={isLoading || !dirty}
          style={{ marginBottom: '8px', marginTop: '8px' }}
          startIcon={<Save />}
        >
          Save
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
        {tab === 'general' && tabs.includes('general') && (
          <GeneralTab
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {tab === 'deps' && tabs.includes('deps') && (
          <DependenciesTab
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {tab === 'io' && tabs.includes('io') && (
          <IOTab
            groupId={groupId}
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {tab === 'execprofile' && tabs.includes('execprofile') && (
          <ExecutionProfileTab
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {tab === 'conditions' && tabs.includes('conditions') && (
          <ConditionsTab
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {tab === 'runtime' && tabs.includes('runtime') && (
          <RuntimeTab
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {tab === 'git' && tabs.includes('git') && (
          <GitTab
            toggle={() => {
              setTab(featuredTab || 'code');
            }}
          />
        )}
        {tab === 'builder' && tabs.includes('builder') && (
          <BuilderTab
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {tab === 'context' && tabs.includes('context') && (
          <ContextTab
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {tab === 'destination' && tabs.includes('destination') && (
          <DestinationTab
            toggle={() => {
              if (featuredTab) {
                setTab(featuredTab);
              }
            }}
          />
        )}
        {(tab === 'code' || featuredTab === 'code') &&
          tabs.includes('code') && (
            <CodeTab featured={task.type === Workflows.EnumTaskType.Function} />
          )}
        {(tab === 'jobdef' || featuredTab === 'jobdef') &&
          tabs.includes('jobdef') && (
            <TapisJobDefTab
              featured={task.type === Workflows.EnumTaskType.Function}
            />
          )}
      </div>
      <DeleteTaskModal
        open={modal === 'delete'}
        toggle={() => {
          setModal(undefined);
        }}
        onDelete={() => {
          history.push(`/workflows/pipelines/${groupId}/${pipelineId}`);
        }}
      />
    </div>
  );
};

export default TaskEditor;

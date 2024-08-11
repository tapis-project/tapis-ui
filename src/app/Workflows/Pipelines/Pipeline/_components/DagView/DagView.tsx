import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { EnvironmentNode, TaskNode, ArgsNode, ConditionalNode } from './Nodes';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
import styles from './DagView.module.scss';
import {
  ListItemText,
  ListItemIcon,
  Divider,
  Chip,
  Drawer,
  Box,
  List,
  ListItem,
  ListItemButton,
  ListSubheader,
} from '@mui/material';
import {
  DataObject,
  Share,
  Add,
  Bolt,
  Publish,
  AltRoute,
} from '@mui/icons-material';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
  Edge,
  Node,
  Panel,
} from '@xyflow/react';
import {
  CreateTaskModal,
  RunPipelineModal,
} from 'app/Workflows/_components/Modals';

import '@xyflow/react/dist/style.css';

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
                Add Predefined Tasks
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

type DagViewProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
};

type View = 'data' | 'dependencies' | 'conditionals';

const DagView: React.FC<DagViewProps> = ({ groupId, pipeline }) => {
  const tasks = pipeline.tasks!;
  const [modal, setModal] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const nodeTypes = useMemo(
    () => ({
      standard: TaskNode,
      args: ArgsNode,
      env: EnvironmentNode,
      conditional: ConditionalNode,
    }),
    []
  );
  const [views, setViews] = useState<{ [K in View]: boolean }>({
    conditionals: true,
    data: true,
    dependencies: true,
  });

  const handleToggleView = (view: View) => {
    setViews({
      ...views,
      [view]: !views[view],
    });
  };

  useEffect(() => {
    setNodes(calculateNodes());
    setEdges(calculateEdges());
  }, [views, groupId, pipeline]);

  const calculateNodes = () => {
    let conditionalOffset = 0;
    let initialNodes: Array<Node> = [];
    let i = 0;
    for (let task of tasks) {
      if (task.conditions!.length > 0 && views.conditionals) {
        initialNodes.push({
          id: `conditional-${task.id!}`,
          position: {
            x: (i + 1 + conditionalOffset) * 350,
            y: Object.entries(pipeline.env!).length * 25 + 30,
          },
          type: 'conditional',
          data: { task: task, groupId, pipelineId: pipeline.id },
        });
        conditionalOffset++;
      }

      initialNodes.push({
        id: task.id!,
        position: {
          x: (i + 1 + conditionalOffset) * 350,
          y: Object.entries(pipeline.env!).length * 25 + 30,
        },
        type: 'standard',
        data: {
          label: task.id!,
          task: task,
          groupId,
          pipelineId: pipeline.id,
          tasks,
        },
      });
      i++;
    }

    initialNodes = [
      ...initialNodes,
      {
        id: `${pipeline.id}-env`,
        position: { x: 0, y: 0 },
        type: 'env',
        data: { pipeline },
      },
      {
        id: `${pipeline.id}-args`,
        position: { x: 0, y: Object.entries(pipeline.env!).length * 25 + 100 },
        type: 'args',
        data: { pipeline },
      },
    ];

    return initialNodes;
  };

  const calculateEdges = () => {
    if (!views.dependencies) {
      return [];
    }
    const initialEdges: Array<Edge> = [];
    for (const task of tasks) {
      if (task.conditions!.length > 0 && views.conditionals) {
        initialEdges.push({
          id: `e-conditional-${task.id}-${task.id}`,
          type: 'step',
          source: `conditional-${task.id}`,
          target: task.id!,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 10,
            height: 10,
            color: '#000000',
          },
          animated: true,
          style: { stroke: '#000000', strokeWidth: '3px' },
        });
      }
      for (const dep of task.depends_on!) {
        // Add edges from the conditional node to the dependent task
        if (task.conditions!.length > 0 && views.conditionals) {
          // Edge from the conditional to the parent task
          initialEdges.push({
            id: `e-conditional-${dep.id}-c-${task.id}`,
            type: 'step',
            source: dep.id!,
            target: `conditional-${task.id}`,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 10,
              height: 10,
              color: '#000000',
            },
            animated: true,
            style: { stroke: '#000000', strokeWidth: '3px' },
          });
        }
        initialEdges.push({
          id: `e-${dep.id}-${task.id}`,
          type: 'step',
          source: dep.id!,
          target: task.id!,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            width: 10,
            height: 10,
            color: '#000000',
          },
          animated: true,
          style: { stroke: '#000000', strokeWidth: '3px' },
        });
      }
    }
    return initialEdges;
  };

  const [nodes, setNodes, onNodesChange] = useNodesState(calculateNodes());
  const [edges, setEdges, onEdgesChange] = useEdgesState(calculateEdges());

  const onConnect = useCallback(
    (params: any) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className={styles['dag']}>
      <ReactFlow
        nodeTypes={nodeTypes}
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        defaultViewport={{ x: 120, y: 60, zoom: 1 }}
      >
        <DagViewDrawer
          groupId={groupId}
          pipelineId={pipeline.id!}
          open={drawerOpen}
          toggle={() => {
            setDrawerOpen(false);
          }}
          onClickCreateTask={() => {
            setModal('createtask');
          }}
          onClickRunPipeline={() => {
            setModal('runpipeline');
          }}
        />
        <Panel position="top-left">
          <Chip
            onClick={() => {
              setDrawerOpen(true);
            }}
            color={'primary'}
            size="small"
            label="actions"
            icon={<Bolt />}
          />
        </Panel>
        <Panel position="top-right">
          <Chip
            onClick={() => {
              handleToggleView('data');
            }}
            variant={views.data ? 'filled' : 'outlined'}
            color="primary"
            style={{ marginLeft: '8px' }}
            size="small"
            label="data"
            icon={<DataObject />}
          />
          <Chip
            onClick={() => {
              handleToggleView('dependencies');
            }}
            variant={views.dependencies ? 'filled' : 'outlined'}
            color="primary"
            style={{ marginLeft: '8px' }}
            size="small"
            label="dependenies"
            icon={<Share />}
          />
          <Chip
            onClick={() => {
              handleToggleView('conditionals');
            }}
            variant={views.conditionals ? 'filled' : 'outlined'}
            color="primary"
            style={{ marginLeft: '8px' }}
            size="small"
            label="conditionals"
            icon={<AltRoute />}
          />
        </Panel>
        <Controls
          position="bottom-left"
          style={{
            color: 'black',
            border: '1px solid #999999',
            borderRadius: '1px',
          }}
        />
        <MiniMap
          position="bottom-right"
          style={{ border: '1px solid #999999', borderRadius: '1px' }}
        />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
      </ReactFlow>
      <CreateTaskModal
        open={modal === 'createtask'}
        toggle={() => {
          setModal(undefined);
        }}
        groupId={groupId}
        pipelineId={pipeline.id!}
      />
      <RunPipelineModal
        open={modal === 'runpipeline'}
        toggle={() => {
          setModal(undefined);
        }}
        groupId={groupId}
        pipelineId={pipeline.id!}
        pipeline={pipeline}
      />
    </div>
  );
};

export default DagView;

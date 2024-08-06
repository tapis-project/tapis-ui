import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
} from 'react';
import { EnvironmentNode, TaskNode, ArgsNode, ConditionalNode } from './Nodes';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { useExtension } from 'extensions';
import styles from './DagView.module.scss';
import { Button } from 'reactstrap';
import Tooltip from '@mui/material/Tooltip';
import { useQueryClient } from 'react-query';
import { TaskEditor } from '../../../_components';
import {
  MenuList,
  MenuItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Paper,
  Chip,
  SpeedDial,
  SpeedDialAction
} from '@mui/material';
import {
  Delete,
  Edit,
  Add
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
  Panel
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';

type DagViewProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
};

type View = 'data' | 'dependencies' | 'conditionals';

const DagView: React.FC<DagViewProps> = ({ groupId, pipeline }) => {
  const tasks = pipeline.tasks!
  const [openDagActions, setOpenDagActions] = React.useState(false);
  const nodeTypes = useMemo(
    () => ({ standard: TaskNode, args: ArgsNode, env: EnvironmentNode, conditional: ConditionalNode }),
    []
  );
  const [views, setViews] = useState<{ [K in View]: boolean }>({
    conditionals: true,
    data: true,
    dependencies: true,
  });

  const dagActions = [
    { icon: <Add />, name: 'New task' },
    { icon: <Add />, name: 'Use task' },
  ]

  const handleToggleView = (view: View) => {
    setViews({
      ...views,
      [view]: !views[view],
    });
  };

  useEffect(() => {
    setNodes(calculateNodes())
    setEdges(calculateEdges())
  }, [views, groupId, pipeline])

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
        conditionalOffset++
      }

      initialNodes.push({
        id: task.id!,
        position: {
          x: (i + 1 + conditionalOffset) * 350,
          y: Object.entries(pipeline.env!).length * 25 + 30,
        },
        type: 'standard',
        data: { label: task.id!, task: task, groupId, pipelineId: pipeline.id },
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

    return initialNodes
  }
  
  const calculateEdges = () => {
    if (!views.dependencies) {return []}
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
    return initialEdges
  }

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
        defaultViewport={{ x: 60, y: 40, zoom: 1 }}
      >
        <Panel position="top-right">
          <Chip
            onClick={() => {
              handleToggleView('data');
            }}
            color={views.data ? 'success' : undefined}
            style={{ marginLeft: '8px' }}
            size="small"
            label="data"
          />
          <Chip
            onClick={() => {
              handleToggleView('dependencies');
            }}
            color={views.dependencies ? 'success' : undefined}
            style={{ marginLeft: '8px' }}
            size="small"
            label="dependenies"
          />
          <Chip
            onClick={() => {
              handleToggleView('conditionals');
            }}
            color={views.conditionals ? 'success' : undefined}
            style={{ marginLeft: '8px' }}
            size="small"
            label="conditionals"
          />
        </Panel>
        <Controls position="top-left" />
        <MiniMap position="bottom-left" />
        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
        <SpeedDial
          ariaLabel="DAG Actions"
          onClose={() => {setOpenDagActions(false)}}
          onOpen={() => {setOpenDagActions(true)}}
          open={openDagActions}
          style={{position: "absolute", "bottom": 40, "right": 40}}
          icon={<Add />}
        >
          {dagActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              tooltipOpen
              onClick={() => {setOpenDagActions(false)}}
            />
          ))}
        </SpeedDial>
      </ReactFlow>
    </div>
  );
};

export default DagView;

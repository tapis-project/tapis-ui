import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useReducer,
} from 'react';
import { EnvironmentNode, TaskNode, ArgsNode } from './Nodes';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { Icon } from '@tapis/tapisui-common';
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

import '@xyflow/react/dist/style.css';

type DagViewProps = {
  tasks: Array<Workflows.Task>;
  pipeline: Workflows.Pipeline;
  groupId: string;
};

type View = 'data' | 'dependencies' | 'conditionals';

const DagView: React.FC<DagViewProps> = ({ groupId, pipeline, tasks }) => {
  const [views, setViews] = useState<{ [K in View]: boolean }>({
    conditionals: true,
    data: true,
    dependencies: false,
  });
  const handleToggleView = (view: View) => {
    setViews({
      ...views,
      [view]: !views[view],
    });
  };
  const nodeTypes = useMemo(
    () => ({ standard: TaskNode, args: ArgsNode, env: EnvironmentNode }),
    []
  );

  let initialNodes: Array<Node> = tasks.map((task, i) => {
    return {
      id: task.id!,
      position: {
        x: (i + 1) * 350,
        y: Object.entries(pipeline.env!).length * 25 + 30,
      },
      type: 'standard',
      data: { label: task.id!, task: task, groupId, pipelineId: pipeline.id },
    };
  });

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

  const initialEdges: Array<Edge> = [];
  for (const task of tasks) {
    for (const dep of task.depends_on!) {
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

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
      </ReactFlow>
    </div>
  );
};

export default DagView;

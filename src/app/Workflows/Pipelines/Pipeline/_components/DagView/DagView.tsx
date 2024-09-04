import React, { useCallback, useMemo, useState, useLayoutEffect } from 'react';
import { EnvironmentNode, TaskNode, ArgsNode, ConditionalNode } from './Nodes';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './DagView.module.scss';
import { DagViewHeader } from './DagViewHeader';
import { Chip } from '@mui/material';
import { DataObject, Share, Bolt, AltRoute } from '@mui/icons-material';
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
  ReactFlowProvider,
  useReactFlow,
} from '@xyflow/react';
import {
  CreateTaskModal,
  RunPipelineModal,
} from 'app/Workflows/_components/Modals';
import { DagViewDrawer } from '../DagViewDrawer';
import ELK, {
  ElkNode,
  ElkExtendedEdge,
  LayoutOptions,
} from 'elkjs/lib/elk.bundled.js';
import '@xyflow/react/dist/style.css';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'mrtree',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

type View = 'data' | 'dependencies' | 'conditionals';

const getLayoutedElements: any = (
  nodes: Array<ElkNode>,
  edges: Array<ElkExtendedEdge>,
  options: LayoutOptions = {}
) => {
  const graph = {
    id: 'root',
    layoutOptions: options,
    children: nodes.map((node) => ({
      ...node,
      targetPosition: 'left',
      sourcePosition: 'right',

      // Hardcode a width and height for elk to use when layouting.
      width: 300,
      height: 100,
    })),
    edges: edges,
  };

  return elk
    .layout(graph)
    .then((layoutedGraph: any) => ({
      nodes: layoutedGraph.children.map((node: ElkNode) => ({
        ...node,
        // React Flow expects a position property on the node instead of `x`
        // and `y` fields.
        position: { x: node.x, y: node.y },
      })),

      edges: layoutedGraph.edges,
    }))
    .catch(console.error);
};

const ELKLayoutFlow: React.FC<DagViewProps> = ({ groupId, pipeline }) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { fitView } = useReactFlow();

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
    alert(!views[view]);
    setViews({
      ...views,
      [view]: !views[view],
    });
  };

  const calculateNodes = useCallback(() => {
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
        height: 200 + 25 * Object.keys(pipeline.env ? pipeline.env : {}).length,
        width: 300,
      },
      {
        id: `${pipeline.id}-args`,
        position: { x: 0, y: Object.entries(pipeline.env!).length * 25 + 100 },
        type: 'args',
        data: { pipeline },
        height:
          200 + 25 * Object.keys(pipeline.params ? pipeline.params : {}).length,
        width: 300,
      },
    ];

    return initialNodes;
  }, [views, setViews, groupId, pipeline]);

  const calculateEdges = useCallback(() => {
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
      const taskInput = task.input ? task.input : {};
      for (let input of Object.entries(taskInput)) {
        let [_, v] = input;
        let hasArgsDep = false;
        let hasEnvDep = false;
        if (hasArgsDep && hasEnvDep) {
          break;
        }
        if (v.value_from?.env !== undefined) {
          // Edge from the environment to the task
          initialEdges.push({
            id: `e-${pipeline.id}-env-${task.id}`,
            type: 'step',
            source: `${pipeline.id}-env`,
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
          hasEnvDep = true;
          continue;
        }

        if (v.value_from?.args !== undefined) {
          // Edge from the environment to the task
          initialEdges.push({
            id: `e-${pipeline.id}-env-${task.id}`,
            type: 'step',
            source: `${pipeline.id}-args`,
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
          hasArgsDep = true;
          continue;
        }
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
  }, [groupId, pipeline]);

  const onConnect = useCallback(
    (params: any) => setEdges((eds: any) => addEdge(params, eds) as any),
    []
  );

  const onLayout = useCallback(
    ({
      direction,
      useInitialNodes = false,
    }: {
      direction: string;
      useInitialNodes: boolean;
    }) => {
      const opts = { 'elk.direction': direction, ...elkOptions };
      const ns = useInitialNodes ? calculateNodes() : nodes;
      const es = useInitialNodes ? calculateEdges() : edges;

      getLayoutedElements(ns, es, opts).then(
        ({ nodes: layoutedNodes, edges: layoutedEdges }: any) => {
          setNodes(layoutedNodes);
          setEdges(layoutedEdges);

          window.requestAnimationFrame(() => fitView());
        }
      );
    },
    [views, setViews, nodes, edges, groupId, pipeline]
  );

  // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({ direction: 'RIGHT', useInitialNodes: true });
  }, [views, setViews, groupId, pipeline]);

  return (
    <div>
      <DagViewHeader
        groupId={groupId}
        pipelineId={pipeline.id!}
        pipelineRunUuid={pipeline.current_run}
      />
      <div className={styles['dag']}>
        <ReactFlow
          nodeTypes={nodeTypes}
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
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
    </div>
  );
};

type DagViewProps = {
  pipeline: Workflows.Pipeline;
  groupId: string;
};

const DagView: React.FC<DagViewProps> = ({ groupId, pipeline }) => {
  return (
    <ReactFlowProvider>
      <ELKLayoutFlow groupId={groupId} pipeline={pipeline} />
    </ReactFlowProvider>
  );
};
export default DagView;

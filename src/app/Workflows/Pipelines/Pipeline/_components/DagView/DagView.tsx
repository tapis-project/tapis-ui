import React, { useCallback, useMemo, useState, useLayoutEffect } from 'react';
import { EnvironmentNode, TaskNode, ArgsNode} from './Nodes';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import styles from './DagView.module.scss';
import { DagViewHeader } from './DagViewHeader';
import { Alert, AlertTitle, Chip } from '@mui/material';
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
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

type View = 'io' | 'flow';

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
  const [view, setView] = useState<View>("io");
  const [modal, setModal] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { patch, isLoading, isError, error, isSuccess, reset } = Hooks.Tasks.usePatch()
  
  const tasks = pipeline.tasks!;
  const env = pipeline.env || {}
  const params = pipeline.params || {}
  
  const create_dependency_edge = (source: string, target: string) => {
    const edge = {
      id: `e-${source}-${target}`,
      type: 'smoothbezier',
      source,
      sourceHandle: `task-${source}-source`,
      target,
      targetHandle: `task-${target}-target`,
      animated: true,
      style: { stroke: '#777777', strokeWidth: '2px' },
    };
    return edge
  }

  const create_io_edge = (source: string, output: string, target: string, input: string) => {
    const edge = {
      id: `e-${source}-${output}-${target}-${input}`,
      type: 'smoothbezier',
      source,
      sourceHandle: `output-${source}-${output}`,
      target,
      targetHandle: `input-${target}-${input}`,
      animated: false,
      style: { stroke: '#777777', strokeWidth: '2px' },
    };
    return edge
  }

  const nodeTypes = useMemo(
    () => ({
      standard: TaskNode,
      args: ArgsNode,
      env: EnvironmentNode
    }),
    []
  );
  

  const handleToggleView = (view: View) => {
    setView(view);
  };

  const calculateNodes = useCallback(() => {
    let initialNodes: Array<Node> = [];
    let i = 0;
    for (let task of tasks) {
      initialNodes.push({
        id: task.id!,
        position: {
          x: (i + 1) * 350,
          y: Object.entries(env!).length * 25 + 30,
        },
        type: 'standard',
        data: {
          label: task.id!,
          task: task,
          groupId,
          pipelineId: pipeline.id,
          tasks,
          showIO: view === "io"
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
        height: 200 + 25 * Object.keys(env).length,
        width: 300,
      },
      {
        id: `${pipeline.id}-args`,
        position: { x: 0, y: Object.entries(env).length * 25 + 100 },
        type: 'args',
        data: { pipeline },
        height:
          200 + 25 * Object.keys(params).length,
        width: 300,
      },
    ];

    return initialNodes;
  }, [view, setView, groupId, pipeline]);

  const calculateEdges = useCallback(() => {
    const initialEdges: Array<Edge> = [];
    for (const task of tasks) {
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
            type: 'smoothbezier',
            source: `${pipeline.id}-env`,
            target: task.id!,
            animated: true,
            style: { stroke: '#777777', strokeWidth: '2px' },
          });
          hasEnvDep = true;
          continue;
        }

        if (v.value_from?.args !== undefined) {
          // Edge from the environment to the task
          initialEdges.push({
            id: `e-${pipeline.id}-env-${task.id}`,
            type: 'smoothbezier',
            source: `${pipeline.id}-args`,
            target: task.id!,
            animated: true,
            style: { stroke: '#777777', strokeWidth: '2px' },
          });
          hasArgsDep = true;
          continue;
        }
      }
      for (const dep of task.depends_on!) {
        initialEdges.push(create_dependency_edge(dep.id!, task.id!));
      }

      // Input and output edges
      if (view === "io") {
        for (const key of Object.keys(taskInput!)) {
          const input = taskInput![key];
          const valueFrom = input.value_from;
          if (valueFrom && valueFrom.task_output) {
            const taskOutput = valueFrom.task_output;
            initialEdges.push(create_io_edge(taskOutput.task_id, taskOutput.output_id, task.id!, key))
          }
        }
      }
    }

    return initialEdges;
  }, [groupId, pipeline, view]);

  const onConnect = useCallback(
    (params: any) => {
      let parentTask = tasks.filter((t) => t.id == params.source)[0];
      let childTask = tasks.filter((t) => t.id == params.target)[0];

      patch(
        {
          groupId,
          pipelineId: pipeline.id!,
          task: {
            type: childTask.type!,
            depends_on: [
              ...childTask.depends_on!.filter((t) => t.id !== parentTask.id),
              {
                id: parentTask.id!
              }
            ]
          } as unknown as Workflows.Task,
          taskId: childTask.id!
        },
        {
          onSuccess: () => {
            setEdges((eds: any) => {
              return addEdge(create_dependency_edge(params.source, params.target), eds) as any;
            })

            reset()
          }
        }
      )
    },
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
    [view, setView, nodes, edges, groupId, pipeline]
  );

  // Calculate the initial layout on mount.
  useLayoutEffect(() => {
    onLayout({ direction: 'RIGHT', useInitialNodes: true });
  }, [view, setView, groupId, pipeline]);

  return (
    <div>
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
      <DagViewHeader
        groupId={groupId}
        pipelineId={pipeline.id!}
        pipelineRunUuid={pipeline.current_run}
        pipeline={pipeline}
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
          zoomOnScroll={true}
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
                handleToggleView('flow');
              }}
              variant={view === "flow" ? 'filled' : 'outlined'}
              color="primary"
              style={{ marginLeft: '8px' }}
              size="small"
              label="flow"
              icon={<Share />}
            />
            <Chip
              onClick={() => {
                handleToggleView('io');
              }}
              variant={view === "io" ? 'filled' : 'outlined'}
              color="primary"
              style={{ marginLeft: '8px' }}
              size="small"
              label="i/o"
              icon={<DataObject />}
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

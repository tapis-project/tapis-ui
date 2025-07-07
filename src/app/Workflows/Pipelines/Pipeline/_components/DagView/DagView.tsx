import React, { useCallback, useMemo, useState, useLayoutEffect } from 'react';
import { EnvironmentNode, TaskNode, ArgsNode, MissingTaskNode } from './Nodes';
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
  Edge,
  Node,
  Panel,
  getOutgoers,
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
import _ from 'lodash';

const elk = new ELK();

const elkOptions = {
  'elk.algorithm': 'org.eclipse.elk.layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
  'elk.layered.considerModelOrder.strategy': 'NODES_AND_EDGES',
  'org.eclipse.elk.portConstraints': 'FIXED_ORDER',
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
  const [view, setView] = useState<View>('io');
  const [modal, setModal] = useState<string | undefined>(undefined);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { patch, isLoading, isError, error, isSuccess, reset } =
    Hooks.Tasks.usePatch();

  const tasks = pipeline.tasks!;

  const { getNodes, getEdges } = useReactFlow();

  const createDependencyEdge = (source: string, target: string) => {
    const edge = {
      id: `e-${source}-${target}`,
      type: 'default',
      source,
      sourceHandle: `task-${source}-source`,
      target,
      targetHandle: `task-${target}-target`,
      animated: true,
      style: { stroke: '#777777', strokeWidth: '2px' },
    };

    return edge;
  };

  const createEnvOrArgToTaskEdge = (
    envKey: string,
    taskId: string,
    inputId: string,
    scope: 'env' | 'args'
  ) => {
    return {
      id: `e-${scope}.${envKey}->${taskId}.${inputId}`,
      type: 'default',
      source: `${scope}-${pipeline.id}`,
      sourceHandle: `${scope === 'env' ? 'env' : 'arg'}-${envKey}`,
      target: taskId,
      targetHandle: `input-${taskId}-${inputId}`,
      animated: false,
      style: { stroke: '#777777', strokeWidth: '2px' },
    };
  };

  const createTaskIOEdge = (
    source: string,
    output: string,
    target: string,
    input: string
  ) => {
    const edge = {
      id: `e-${source}-${output}-${target}-${input}`,
      type: 'default',
      source,
      sourceHandle: `output-${source}-${output}`,
      target,
      targetHandle: `input-${target}-${input}`,
      animated: false,
      style: { stroke: '#777777', strokeWidth: '2px' },
    };
    return edge;
  };

  const nodeTypes = useMemo(
    () => ({
      standard: TaskNode,
      args: ArgsNode,
      env: EnvironmentNode,
      missing: MissingTaskNode,
    }),
    []
  );

  const handleToggleView = (view: View) => {
    setView(view);
  };

  type ResolvedRefs = {
    env: Array<String>;
    params: Array<String>;
    taskOutputs: {
      [key: string]: Array<string>;
    };
  };

  const resolveTaskInputRefs = (
    inputs: { [key: string]: Workflows.SpecWithValue } = {}
  ): ResolvedRefs => {
    let env: ResolvedRefs['env'] = [];
    let params: ResolvedRefs['params'] = [];
    let taskOutputs: ResolvedRefs['taskOutputs'] = {};
    for (let [_, input] of Object.entries(inputs)) {
      let valueFrom = input.value_from || {};
      let sources = Object.keys(valueFrom);
      for (let source of sources) {
        switch (source) {
          case 'env': {
            env.push(valueFrom.env!);
            continue;
          }
          case 'args': {
            params.push(valueFrom.args!);
            continue;
          }
          case 'task_output': {
            let output = valueFrom.task_output;
            if (!output) {
              continue;
            }

            taskOutputs = {
              ...taskOutputs,
              [output.task_id]: [
                ...(taskOutputs[output.task_id] || []),
                output.output_id,
              ],
            };
            continue;
          }
        }
      }
    }

    return {
      env,
      params,
      taskOutputs,
    };
  };

  const calculateNodes = useCallback(() => {
    let initialNodes: Array<Node> = [];
    let taskIds = tasks.map((task) => task.id!);
    let taskInputRefs: ResolvedRefs = {
      env: [],
      params: [],
      taskOutputs: {},
    };

    // First resolve all of the input references for each task. This will need
    // to be done before we create the first node
    for (let task of tasks) {
      let resolvedTaskInputRefs = resolveTaskInputRefs(task.input);
      taskInputRefs = {
        env: [...taskInputRefs.env, ...resolvedTaskInputRefs.env],
        params: [...taskInputRefs.params, ...resolvedTaskInputRefs.params],
        taskOutputs: {
          ...resolvedTaskInputRefs.taskOutputs,
          ...taskInputRefs.taskOutputs,
        },
      };
    }

    // Remove duplicates from each input source
    taskInputRefs.env = Array.from(new Set(taskInputRefs.env)).filter(
      (e) => e !== undefined
    );
    taskInputRefs.params = Array.from(new Set(taskInputRefs.params)).filter(
      (p) => p !== undefined
    );
    for (let taskId of Object.keys(taskInputRefs.taskOutputs)) {
      taskInputRefs.taskOutputs[taskId] = Array.from(
        new Set(taskInputRefs.taskOutputs[taskId])
      );
    }

    for (let task of tasks) {
      initialNodes.push({
        id: task.id!,
        position: {
          x: 0,
          y: 0,
        },
        type: 'standard',
        data: {
          label: task.id!,
          task: task,
          groupId,
          pipelineId: pipeline.id,
          tasks,
          showIO: view === 'io',
          referencedKeys: (taskInputRefs.taskOutputs[task.id!] || []).filter(
            (e) => e !== undefined
          ),
        },
      });

      // Check the dependencies for missing tasks. Create a MissingTaskNode for each
      // missing task
      for (let dep of task.depends_on || []) {
        if (!taskIds.includes(dep.id!)) {
          initialNodes.push({
            id: dep.id!,
            position: {
              x: 0,
              y: 0,
            },
            type: 'missing',
            data: {
              taskId: dep.id!,
              inputs: [],
              outputs: [],
              showIO: view === 'io',
            },
          });
        }
      }
    }

    initialNodes = [
      ...initialNodes,
      {
        id: `env-${pipeline.id}`,
        position: { x: 0, y: 0 },
        type: 'env',
        data: {
          pipeline,
          referencedKeys: taskInputRefs.env.filter((e) => e !== undefined),
          showIO: view === 'io',
        },
      },
      {
        id: `args-${pipeline.id}`,
        position: { x: 0, y: 0 },
        type: 'args',
        data: {
          pipeline,
          referencedKeys: taskInputRefs.params.filter((e) => e !== undefined),
          showIO: view === 'io',
        },
      },
    ];

    return initialNodes;
  }, [view, setView, groupId, pipeline]);

  const calculateEdges = useCallback(() => {
    const initialEdges: Array<Edge> = [];
    for (const task of tasks) {
      const taskInput = task.input ? task.input : {};
      for (let input of Object.entries(taskInput)) {
        let [k, v] = input;

        if (v.value_from?.env !== undefined) {
          initialEdges.push(
            createEnvOrArgToTaskEdge(v.value_from.env, task.id!, k, 'env')
          );
          continue;
        }

        if (v.value_from?.args !== undefined) {
          // Edge from the environment to the task
          initialEdges.push(
            createEnvOrArgToTaskEdge(v.value_from.args, task.id!, k, 'args')
          );
          continue;
        }
      }

      for (const dep of task.depends_on!) {
        initialEdges.push(createDependencyEdge(dep.id!, task.id!));
      }

      // Input and output edges
      if (view === 'io') {
        for (const key of Object.keys(taskInput!)) {
          const input = taskInput![key];
          const valueFrom = input.value_from;
          if (valueFrom && valueFrom.task_output) {
            const taskOutput = valueFrom.task_output;
            initialEdges.push(
              createTaskIOEdge(
                taskOutput.task_id,
                taskOutput.output_id,
                task.id!,
                key
              )
            );
          }
        }
      }
    }

    return initialEdges;
  }, [groupId, pipeline, view]);

  const handleDependencyPatch = (parentTaskId: string, childTaskId: string) => {
    let parentTask = tasks.filter((t) => t.id == parentTaskId)[0];
    let childTask = tasks.filter((t) => t.id == childTaskId)[0];

    // Optimistically create the edge
    setEdges((eds: any) => {
      return addEdge(
        createDependencyEdge(parentTaskId, childTaskId),
        eds
      ) as any;
    });
    patch(
      {
        groupId,
        pipelineId: pipeline.id!,
        task: {
          type: childTask.type!,
          depends_on: [
            ...childTask.depends_on!.filter((t) => t.id !== parentTask.id),
            {
              id: parentTask.id!,
            },
          ],
        } as unknown as Workflows.Task,
        taskId: childTask.id!,
      },
      {
        onSuccess: () => {
          reset();
        },
        onError: () => {
          setEdges((eds) => {
            return eds.filter(
              (ed: any) =>
                ed.source !== parentTaskId && ed.target !== childTaskId
            );
          });
        },
      }
    );
  };

  const handleTaskInputPatch = (
    parentTaskId: string,
    outputId: string,
    childTaskId: string,
    inputId: string
  ) => {
    let childTask = tasks.filter((t) => t.id == childTaskId)[0];
    let input = childTask.input || {};

    patch(
      {
        groupId,
        pipelineId: pipeline.id!,
        task: {
          type: childTask.type!,
          input: {
            ...input,
            [inputId]: {
              value_from: {
                task_output: {
                  task_id: parentTaskId,
                  output_id: outputId,
                },
              },
            },
          },
        } as unknown as Workflows.Task,
        taskId: childTaskId!,
      },
      {
        onSuccess: () => {
          setEdges((eds: any) => {
            return addEdge(
              createTaskIOEdge(parentTaskId, outputId, childTaskId, inputId),
              eds
            ) as any;
          });

          reset();
        },
      }
    );
  };

  const handlePipelineInputPatch = (
    taskId: string,
    sourceKey: string,
    inputId: string,
    scope: 'env' | 'args'
  ) => {
    let task = tasks.filter((t) => t.id == taskId)[0];
    let input = task.input || {};

    patch(
      {
        groupId,
        pipelineId: pipeline.id!,
        task: {
          type: task.type!,
          input: {
            ...input,
            [inputId]: {
              value_from: {
                [scope]: sourceKey,
              },
            },
          },
        } as unknown as Workflows.Task,
        taskId: task.id!,
      },
      {
        onSuccess: () => {
          setEdges((eds: any) => {
            return addEdge(
              createEnvOrArgToTaskEdge(sourceKey, task.id!, inputId, scope),
              eds
            ) as any;
          });

          reset();
        },
      }
    );
  };

  const onConnect = useCallback((params: any) => {
    if (
      params.sourceHandle.startsWith('task') &&
      params.targetHandle.startsWith('task')
    ) {
      handleDependencyPatch(params.source, params.target);
    }

    if (
      params.sourceHandle.startsWith('output') &&
      params.targetHandle.startsWith('input')
    ) {
      let inputIdPrefix = `input-${params.target}-`;
      let inputId: string = params.targetHandle.slice(inputIdPrefix.length);

      let outputIdPrefix = `output-${params.source}-`;
      let outputId: string = params.sourceHandle.slice(outputIdPrefix.length);

      handleTaskInputPatch(params.source, outputId, params.target, inputId);
    }

    if (
      params.source === `args-${pipeline.id}` &&
      params.targetHandle.startsWith('input')
    ) {
      let inputIdPrefix = `input-${params.target}-`;
      let inputId: string = params.targetHandle.slice(inputIdPrefix.length);

      let sourceKeyPrefix = `arg-`;
      let sourceKey: string = params.sourceHandle.slice(sourceKeyPrefix.length);
      handlePipelineInputPatch(params.target, sourceKey, inputId, 'args');
    }

    if (
      params.source === `env-${pipeline.id}` &&
      params.targetHandle.startsWith('input')
    ) {
      let inputIdPrefix = `input-${params.target}-`;
      let inputId: string = params.targetHandle.slice(inputIdPrefix.length);

      let sourceKeyPrefix = `env-`;
      let sourceKey: string = params.sourceHandle.slice(sourceKeyPrefix.length);
      handlePipelineInputPatch(params.target, sourceKey, inputId, 'env');
    }
  }, []);

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

  const isValidConnection = useCallback(
    (connection: any) => {
      // we are using getNodes and getEdges helpers here
      // to make sure we create isValidConnection function only once
      const nodes = getNodes();
      const edges = getEdges();
      const target = nodes.find((node) => node.id === connection.target);
      const hasCycle = (node: any, visited = new Set()) => {
        if (visited.has(node.id)) return false;

        visited.add(node.id);

        for (const outgoer of getOutgoers(node, nodes, edges)) {
          if (outgoer.id === connection.source) return true;
          if (hasCycle(outgoer, visited)) return true;
        }
      };

      if (target!.id === connection.source) return false;
      return !hasCycle(target);
    },
    [getNodes, getEdges]
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
      <div style={{ display: 'flex', flexDirection: 'row' }}>
        <div style={{ position: 'relative' }}>
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
        </div>
        <div className={styles['dag']}>
          <ReactFlow
            nodeTypes={nodeTypes}
            nodes={nodes}
            edges={edges}
            onConnect={onConnect}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            isValidConnection={isValidConnection}
            defaultViewport={{ x: 120, y: 60, zoom: 1 }}
            zoomOnScroll={true}
          >
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
            <Panel
              position="bottom-left"
              style={{ marginLeft: '56px', userSelect: 'none' }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  backgroundColor: '#FFFFFFF',
                  padding: '8px',
                  border: '1px solid #666666',
                  borderRadius: '4px',
                  fontSize: '10px',
                }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}
                >
                  <svg height="10" width="40">
                    <line
                      x1="0"
                      y1="5"
                      x2="40"
                      y2="5"
                      stroke="#777"
                      strokeWidth="1"
                      strokeDasharray="5,5"
                    />
                  </svg>
                  <span> Dependency </span>
                </div>
                <div
                  style={{ display: 'flex', flexDirection: 'row', gap: '8px' }}
                >
                  <svg height="10" width="40">
                    <line
                      x1="0"
                      y1="5"
                      x2="40"
                      y2="5"
                      stroke="#777"
                      strokeWidth="1"
                      strokeDasharray="0"
                    />
                  </svg>
                  <span>I/O</span>
                </div>
              </div>
            </Panel>
            <Panel position="top-right">
              <Chip
                onClick={() => {
                  handleToggleView('flow');
                }}
                variant={view === 'flow' ? 'filled' : 'outlined'}
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
                variant={view === 'io' ? 'filled' : 'outlined'}
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
        </div>
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

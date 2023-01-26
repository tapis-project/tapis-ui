import React, { useState } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { useDetails } from 'tapis-hooks/workflows/pipelines';
import { SectionMessage, SectionHeader } from 'tapis-ui/_common';
import { QueryWrapper } from 'tapis-ui/_wrappers';
import { Link } from 'react-router-dom';
import { Toolbar } from '../../_components';
import styles from './Pipeline.module.scss';
import { Button, ButtonGroup, Table } from 'reactstrap';
import ReactFlow, { ReactFlowProvider } from "reactflow"
import 'reactflow/dist/style.css';
// import ReactFlow, {
//   Node,
//   useNodesState,
//   useEdgesState,
//   addEdge,
//   Connection,
//   Edge,
// } from 'reactflow';
// this is important! You need to import the styles from the lib to make it work
// import 'reactflow/dist/style.css';

type TaskProps = {
  task: Workflows.Task;
};

const Task: React.FC<TaskProps> = ({ task }) => {
  return (
    <div id={`task-${task.id}`} className={`${styles['task']}`}>
      <div className={`${styles['task-header']}`}>{task.id}</div>
      <div className={`${styles['task-body']}`}>
        <p>
          <b>type: </b>
          {task.type}
        </p>
        <p>
          <b>description: </b>
          {task.description || <i>None</i>}
        </p>
      </div>
      {!!task?.depends_on?.length && (
        <div>
          <div className={`${styles['task-header']}`}>dependencies</div>
          <div className={`${styles['task-body']}`}>
            {task.depends_on.map((dependency) => {
              return <p>{dependency.id}</p>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};

type PipelineProps = {
  groupId: string;
  pipelineId: string;
};

enum ViewEnum {
  Default = "Default",
  Dag = "Dag"
}

type ViewProps = {
  type: ViewEnum,
  tasks: Array<Workflows.Task>
}

const View: React.FC<ViewProps> = ({type, tasks}) => {
  switch (type) {
    case ViewEnum.Default:
      return (
        <div id={"default-task-view"}>
          {
           tasks.map((task) => {
              return (
                <div id="tasks" key={task.id} className={`${styles['tasks']}`}>
                  <Task task={task} />
                </div>
              );
            })
          }
        </div>
      )
    case ViewEnum.Dag:
      return <DagView tasks={tasks}/>
    default:
      return <></>
  }
}

const DagView: React.FC<{tasks: Array<Workflows.Task>}> = ({tasks}) => {
  return (
    <div className="Flow">
      DAG view unavailable
      {/* <ReactFlow
        nodes={[]}
        // onNodesChange={() => }
        edges={[]}
        // onEdgesChange={onEdgesChange}
        // onConnect={onConnect}
        fitView
        // nodeTypes={nodeTypes}
      /> */}
    </div>
  )
}

const Pipeline: React.FC<PipelineProps> = ({ groupId, pipelineId }) => {
  const [ view, setView ] = useState<ViewEnum>(ViewEnum.Default)
  const { data, isLoading, error } = useDetails({ groupId, pipelineId });
  const pipeline: Workflows.Pipeline = data?.result!;

  return (
    <QueryWrapper isLoading={isLoading} error={error}>
      {pipeline && (
        <div id={`pipeline`} className={styles["grid"]}>
          <SectionHeader>
            <span>Tasks <span className={styles['count']}>{pipeline.tasks?.length || 0}</span></span>
            <ButtonGroup>
              <Button
                size="sm"
                onClick={() => setView(ViewEnum.Default)}
                active={view === ViewEnum.Default}
              >
                Default
              </Button>
              <Button
                size="sm"
                onClick={() => setView(ViewEnum.Dag)}
                active={view === ViewEnum.Dag}
              >
                DAG
              </Button>
            </ButtonGroup>
          </SectionHeader>
          <Toolbar
            buttons={['createtask', 'runpipeline']}
            groupId={groupId}
            pipelineId={pipelineId}
          />
          <Table dark bordered style={{ margin: 0 }}>
              <thead>
                <tr>
                  <th className={styles["center"]}>id</th>
                  <th>uuid</th>
                  <th>last run</th>
                  <th>previous run</th>
                  <th className={styles["center"]}>runs</th>
                </tr>
              </thead>
              <tbody>
              <td className={styles["center"]}>{pipeline.id}</td>
              <td>{pipeline.uuid}</td>
              <td>
                {
                  pipeline.current_run && (
                    <Link
                      to={`/workflows/pipelines/${groupId}/${pipelineId}/runs/${pipeline.current_run}`}
                    >
                      view
                    </Link>
                  )
                }
              </td>
              <td>
                {
                  pipeline.last_run && (
                    <Link
                      to={`/workflows/pipelines/${groupId}/${pipelineId}/runs/${pipeline.last_run}`}
                    >
                      view
                    </Link>
                    )
                }
              </td>
              <td className={styles['center']}>
                <Link
                  to={`/workflows/pipelines/${groupId}/${pipelineId}/runs`}
                >
                  view
                </Link>
              </td>
              </tbody>
            </Table>
          {pipeline.tasks?.length ? (
            <View type={view} tasks={pipeline.tasks}/>
          ) : (
            <SectionMessage type="info">No tasks</SectionMessage>
          )}
        </div>
      )}
    </QueryWrapper>
  );
};

export default Pipeline;

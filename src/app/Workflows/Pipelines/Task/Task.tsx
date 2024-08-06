import React from 'react';
import { TaskEditor } from '../_components';
import { Workflows } from '@tapis/tapis-typescript';
import { Workflows as Hooks } from '@tapis/tapisui-hooks';
import { QueryWrapper } from '@tapis/tapisui-common';
import { Link } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';
import styles from './Task.module.scss';

type TaskProps = {
  groupId: string;
  pipelineId: string;
  taskId: string;
};

const Task: React.FC<TaskProps> = ({ groupId, pipelineId, taskId }) => {
  const { data, isLoading, error } = Hooks.Tasks.useList({
    groupId,
    pipelineId,
  });
  const tasks = data?.result || [];
  const task = tasks.filter((task) => task.id === taskId)[0];

  const renderTaskEditor = (task: Workflows.Task) => {
    switch (task.type) {
      case Workflows.EnumTaskType.Function:
        return (
          <TaskEditor
            groupId={groupId}
            pipelineId={pipelineId}
            task={task}
            tasks={tasks}
            tabs={['general']}
            defaultTab="general"
          />
        );
      case Workflows.EnumTaskType.Template:
        return (
          <TaskEditor
            groupId={groupId}
            pipelineId={pipelineId}
            task={task}
            tasks={tasks}
            tabs={['general']}
            defaultTab="general"
          />
        );
      case Workflows.EnumTaskType.Request:
        return (
          <TaskEditor
            groupId={groupId}
            pipelineId={pipelineId}
            task={task}
            tasks={tasks}
            tabs={['general']}
            defaultTab="general"
          />
        );
      case Workflows.EnumTaskType.ImageBuild:
        return (
          <TaskEditor
            groupId={groupId}
            pipelineId={pipelineId}
            task={task}
            tasks={tasks}
            tabs={['general']}
            defaultTab="general"
          />
        );
      case Workflows.EnumTaskType.Application:
        return (
          <TaskEditor
            groupId={groupId}
            pipelineId={pipelineId}
            task={task}
            tasks={tasks}
            tabs={['general']}
            defaultTab="general"
          />
        );
      case Workflows.EnumTaskType.TapisJob:
        return (
          <TaskEditor
            groupId={groupId}
            pipelineId={pipelineId}
            task={task}
            tasks={tasks}
            tabs={['general']}
            defaultTab="general"
          />
        );
      case Workflows.EnumTaskType.TapisActor:
        return (
          <TaskEditor
            groupId={groupId}
            pipelineId={pipelineId}
            task={task}
            tasks={tasks}
            tabs={['general']}
            defaultTab="general"
          />
        );
    }
  };

  return (
    <div>
      <div className={styles['back']}>
        <Link to={`/workflows/pipelines/${groupId}/${pipelineId}`}>
          <ArrowBack /> Pipeline: {pipelineId}
        </Link>
      </div>
      <QueryWrapper isLoading={isLoading} error={error}>
        {task !== undefined ? (
          renderTaskEditor(task)
        ) : (
          <p style={{ color: 'red' }}>Task with id '{taskId}' does not exist</p>
        )}
      </QueryWrapper>
    </div>
  );
};

export default Task;

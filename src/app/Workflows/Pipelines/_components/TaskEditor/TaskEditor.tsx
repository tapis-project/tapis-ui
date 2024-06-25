import React, { useCallback } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import styles from './TaskEditor.module.scss';
import { Close, ArrowBack } from '@mui/icons-material';
import { FunctionTaskEditor } from './FunctionTaskEditor';

type TaskEditorProps = {
  task: Workflows.Task;
  tasks: Array<Workflows.Task>;
  toggle: () => void;
};

const TaskEditor: React.FC<TaskEditorProps> = ({ task, tasks, toggle }) => {
  const renderTaskEditor = useCallback(
    (task: Workflows.Task) => {
      switch (task.type) {
        case Workflows.EnumTaskType.Function:
          return <FunctionTaskEditor task={task} tasks={tasks} />;
        case Workflows.EnumTaskType.Template:
          return `${task.type} task editor unsupported`;
        case Workflows.EnumTaskType.Request:
          return `${task.type} task editor unsupported`;
        case Workflows.EnumTaskType.ImageBuild:
          return `${task.type} task editor unsupported`;
        case Workflows.EnumTaskType.Application:
          return `${task.type} task editor unsupported`;
        case Workflows.EnumTaskType.TapisJob:
          return `${task.type} task editor unsupported`;
        case Workflows.EnumTaskType.TapisActor:
          return `${task.type} task editor unsupported`;
      }
    },
    [task]
  );

  return (
    <div>
      <div className={styles['menu']}>
        <ArrowBack onClick={toggle} className={styles['back']} />
        <h2>Task Editor</h2>
        <Close onClick={toggle} className={styles['close']} />
      </div>
      <div className={styles['container']}>{renderTaskEditor(task)}</div>
    </div>
  );
};

export default TaskEditor;

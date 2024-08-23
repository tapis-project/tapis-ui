import React, { useState, useMemo } from 'react';
import { Workflows } from '@tapis/tapis-typescript';
import { TaskUpdateContext } from './TaskUpdateContext';

type TaskUpdateProviderProps = {
  task: Workflows.Task;
  tasks: Array<Workflows.Task>;
  groupId: string;
  pipelineId: string;
};

// Sets the value of the patch to state.
// TODO Consider removing task from the function signature as `task` is available
// from props
export type PatchTaskArgs = (
  task: Workflows.Task,
  data: Partial<Workflows.Task>,
  callback?: () => void
) => void;

const TaskUpdateProvider: React.FC<
  React.PropsWithChildren<TaskUpdateProviderProps>
> = ({ children, task, tasks, groupId, pipelineId }) => {
  // This flag indicates whether a task has been patched but has yet to be
  // committed
  const [dirty, setDirty] = useState(false);

  // The state and setter of the task patch to be commited
  const [taskPatch, setTaskPatch] = useState<Partial<Workflows.FunctionTask>>(
    JSON.parse(JSON.stringify(task))
  );

  // TODO figure out how to track the diff between patch and task
  const dependentTasks = useMemo(() => {
    return tasks.filter((t) => {
      for (let dep of t.depends_on!) {
        if (dep.id === task.id) {
          return true;
        }
      }
      return false;
    });
  }, [task, tasks, taskPatch]);

  const patchTask: PatchTaskArgs = (task, data) => {
    setTaskPatch({
      ...task,
      ...data,
    });
    setDirty(true);
  };

  return (
    <TaskUpdateContext.Provider
      value={{
        setTaskPatch: patchTask,
        taskPatch,
        task,
        tasks,
        groupId,
        pipelineId,
        dependentTasks,
        dirty,
        setDirty: (isDirty: boolean) => {
          setDirty(isDirty);
        },
      }}
    >
      {children}
    </TaskUpdateContext.Provider>
  );
};

export default TaskUpdateProvider;

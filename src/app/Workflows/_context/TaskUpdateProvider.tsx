import React, { useState, useMemo } from "react"
import { Workflows } from "@tapis/tapis-typescript";
import { TaskUpdateContext } from "./TaskUpdateContext"

type TaskUpdateProviderProps = {
  task: Workflows.Task,
  tasks: Array<Workflows.Task>
  groupId: string,
  pipelineId: string
}

const TaskUpdateProvider: React.FC<React.PropsWithChildren<TaskUpdateProviderProps>> = ({children, task, tasks, groupId, pipelineId}) => {
  const [taskPatch, setTaskPatch] = useState<Partial<Workflows.FunctionTask>>(JSON.parse(JSON.stringify(task)));
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
  
  const patchTask = (task: Workflows.Task, data: Partial<Workflows.Task>) => {
    setTaskPatch({
      ...task,
      ...data,
    });
  };

  return (
    <TaskUpdateContext.Provider value={{
      setTaskPatch: patchTask,
      taskPatch,
      task,
      tasks,
      groupId,
      pipelineId,
      dependentTasks
    }}>
      {children}
    </TaskUpdateContext.Provider>
  )
}

export default TaskUpdateProvider
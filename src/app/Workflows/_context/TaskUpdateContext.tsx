import React, { createContext } from 'react';
import { Workflows } from '@tapis/tapis-typescript';

export type TaskUpdateContextProps<T> = {
  groupId: string;
  pipelineId: string;
  task: T;
  tasks: Array<T>;
  taskPatch: Partial<T>;
  dependentTasks: Array<Workflows.Task>;
  dirty: boolean;
  setDirty: (isDirty: boolean) => void;
  setTaskPatch: (task: T, patch: Partial<T>) => void;
};

export const TaskUpdateContext =
  createContext<TaskUpdateContextProps<any> | null>(null);

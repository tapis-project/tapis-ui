import { Workflows } from '@tapis/tapis-typescript';
import { task as task0 } from './generate-tapis-jwt';
import { task as task1 } from './start-pod';
import { task as task2 } from './stop-pod';
export const tasks: Array<Workflows.FunctionTask> = [
  Workflows.FunctionTaskFromJSON(task0),
  Workflows.FunctionTaskFromJSON(task1),
  Workflows.FunctionTaskFromJSON(task2),
];

import { Workflows } from '@tapis/tapis-typescript';
import { task as task0 } from './test-function';
import { task as task1 } from './test-function-2';
export const tasks: Array<Workflows.Task> = [
  Workflows.FunctionTaskFromJSON(task0),
  Workflows.FunctionTaskFromJSON(task1),
];

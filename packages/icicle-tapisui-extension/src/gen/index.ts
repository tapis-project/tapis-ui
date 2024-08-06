import { Workflows } from '@tapis/tapis-typescript';
import { task as task0 } from './django-search';
export const tasks: Array<Workflows.FunctionTask> = [
  Workflows.FunctionTaskFromJSON(task0),
];

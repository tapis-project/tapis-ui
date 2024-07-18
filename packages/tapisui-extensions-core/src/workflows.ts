import { Workflows } from '@tapis/tapis-typescript';

export type WorkflowsCustomizations = {
  dagComponent: unknown;
  dagTasks: Array<Workflows.FunctionTask>;
  dagDefaultView: boolean;
  home: unknown;
};

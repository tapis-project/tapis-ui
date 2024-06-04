import { Workflows } from '@tapis/tapis-typescript';

export type WorkflowsCustomizations = {
    dagComponent: unknown;
    dagTasks: Array<Partial<Workflows.Task>>;
    home: unknown;
  };
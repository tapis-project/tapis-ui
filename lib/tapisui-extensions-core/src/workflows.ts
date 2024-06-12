import { Workflows } from '@tapis/tapis-typescript';



export type WorkflowsCustomizations = {
    dagComponent: unknown;
    dagTasks: Array<Workflows.Task>;
    dagDefaultView: boolean
    home: unknown;
  };